import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Cart } from '../entities/cart.entity';
import { CartItem } from '../entities/cart-item.entity';
import { Product } from '../../products/entities/product.entity';
import { CartStatus } from '../entities/cart-status.enum';
import { ICartRepository } from './cart.repository.interface';
import { AddCartItemDto } from '../dto/add-cart-item.dto';
import { UpdateCartItemDto } from '../dto/update-cart-item.dto';

@Injectable()
export class CartRepository implements ICartRepository {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Cart)
    private readonly cartRepo: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly itemRepo: Repository<CartItem>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async getOpenCart(userId: string): Promise<Cart> {
    const cart = await this.getOrCreateOpenCart(userId);
    return this.loadCart(cart.id);
  }

  async addItem(userId: string, dto: AddCartItemDto): Promise<Cart> {
    return this.dataSource.transaction(async (manager) => {
      const productRepo = manager.getRepository(Product);
      const itemRepo = manager.getRepository(CartItem);

      const product = await productRepo.findOne({
        where: { id: dto.productId, isActive: true, isArchived: false },
      });
      if (!product) {
        throw new NotFoundException(`Product ${dto.productId} not found`);
      }

      const cart = await this.getOrCreateOpenCart(userId, manager);

      const existingItem = await itemRepo.findOne({
        where: {
          cart: { id: cart.id },
          product: { id: dto.productId },
          isActive: true,
          isArchived: false,
        },
        relations: ['product'],
      });

      const availableStock = Number(product.stock ?? 0);
      const currentQuantity = Number(existingItem?.quantity ?? 0);
      const targetQuantity = currentQuantity + dto.quantity;

      if (availableStock < targetQuantity) {
        throw new ConflictException(`Insufficient stock for product ${dto.productId}`);
      }

      if (existingItem) {
        existingItem.quantity = targetQuantity;
        existingItem.totalPrice = Number(existingItem.unitPrice) * targetQuantity;
        existingItem.lastChangedBy = userId;
        await itemRepo.save(existingItem);
      } else {
        const unitPrice = Number(product.price);
        const item = itemRepo.create({
          cart: { id: cart.id } as Cart,
          product: { id: product.id } as Product,
          quantity: dto.quantity,
          unitPrice,
          totalPrice: unitPrice * dto.quantity,
          createdBy: userId,
          lastChangedBy: userId,
        });
        await itemRepo.save(item);
      }

      await this.recalculateCartTotals(cart.id, userId, manager);
      return this.loadCart(cart.id, manager);
    });
  }

  async updateItem(userId: string, itemId: string, dto: UpdateCartItemDto): Promise<Cart> {
    return this.dataSource.transaction(async (manager) => {
      const itemRepo = manager.getRepository(CartItem);
      const productRepo = manager.getRepository(Product);

      const item = await itemRepo.findOne({
        where: {
          id: itemId,
          isActive: true,
          isArchived: false,
          cart: {
            user: { id: userId },
            status: CartStatus.OPEN,
            isActive: true,
            isArchived: false,
          },
        },
        relations: ['cart', 'product'],
      });

      if (!item) {
        throw new NotFoundException(`Cart item ${itemId} not found`);
      }

      const product = await productRepo.findOne({
        where: { id: item.product.id, isActive: true, isArchived: false },
      });
      if (!product) {
        throw new NotFoundException(`Product ${item.product.id} not found`);
      }

      const availableStock = Number(product.stock ?? 0);
      if (availableStock < dto.quantity) {
        throw new ConflictException(`Insufficient stock for product ${item.product.id}`);
      }

      item.quantity = dto.quantity;
      item.totalPrice = Number(item.unitPrice) * dto.quantity;
      item.lastChangedBy = userId;
      await itemRepo.save(item);

      await this.recalculateCartTotals(item.cart.id, userId, manager);
      return this.loadCart(item.cart.id, manager);
    });
  }

  async removeItem(userId: string, itemId: string): Promise<Cart> {
    return this.dataSource.transaction(async (manager) => {
      const itemRepo = manager.getRepository(CartItem);

      const item = await itemRepo.findOne({
        where: {
          id: itemId,
          isActive: true,
          isArchived: false,
          cart: {
            user: { id: userId },
            status: CartStatus.OPEN,
            isActive: true,
            isArchived: false,
          },
        },
        relations: ['cart'],
      });

      if (!item) {
        throw new NotFoundException(`Cart item ${itemId} not found`);
      }

      item.isActive = false;
      item.isArchived = true;
      item.lastChangedBy = userId;
      await itemRepo.save(item);

      await this.recalculateCartTotals(item.cart.id, userId, manager);
      return this.loadCart(item.cart.id, manager);
    });
  }

  async clear(userId: string): Promise<Cart> {
    return this.dataSource.transaction(async (manager) => {
      const cart = await this.getOrCreateOpenCart(userId, manager);
      await manager.getRepository(CartItem).update(
        {
          cart: { id: cart.id },
          isActive: true,
          isArchived: false,
        },
        {
          isActive: false,
          isArchived: true,
          lastChangedBy: userId,
        },
      );

      await this.recalculateCartTotals(cart.id, userId, manager);
      return this.loadCart(cart.id, manager);
    });
  }

  async checkout(userId: string): Promise<Cart> {
    return this.dataSource.transaction(async (manager) => {
      const cart = await manager.getRepository(Cart)
        .createQueryBuilder('cart')
        .where('cart.status = :status', { status: CartStatus.OPEN })
        .andWhere('cart.isActive = true')
        .andWhere('cart.isArchived = false')
        .andWhere('cart.userId = :userId', { userId })
        .setLock('pessimistic_write')
        .getOne();

      if (!cart) {
        throw new NotFoundException('Open cart not found');
      }

      const items = await manager.getRepository(CartItem)
        .createQueryBuilder('item')
        .innerJoinAndSelect('item.product', 'product')
        .where('item.cartId = :cartId', { cartId: cart.id })
        .andWhere('item.isActive = true')
        .andWhere('item.isArchived = false')
        .setLock('pessimistic_write')
        .getMany();

      if (items.length === 0) {
        throw new BadRequestException('Cart is empty');
      }

      const productRepo = manager.getRepository(Product);
      for (const item of items) {
        const product = await productRepo.createQueryBuilder('product')
          .where('product.id = :id', { id: item.product.id })
          .andWhere('product.isActive = true')
          .andWhere('product.isArchived = false')
          .setLock('pessimistic_write')
          .getOne();

        if (!product) {
          throw new NotFoundException(`Product ${item.product.id} not found`);
        }

        const availableStock = Number(product.stock ?? 0);
        const requestedQuantity = Number(item.quantity);
        if (availableStock < requestedQuantity) {
          throw new ConflictException(`Insufficient stock for product ${product.id}`);
        }

        product.stock = availableStock - requestedQuantity;
        product.lastChangedBy = userId;
        await productRepo.save(product);
      }

      cart.status = CartStatus.PURCHASED;
      cart.purchasedAt = new Date();
      cart.lastChangedBy = userId;
      await manager.getRepository(Cart).save(cart);

      await this.recalculateCartTotals(cart.id, userId, manager);
      return this.loadCart(cart.id, manager);
    });
  }

  private async getOrCreateOpenCart(userId: string, manager?: EntityManager): Promise<Cart> {
    const cartRepo = manager?.getRepository(Cart) ?? this.cartRepo;
    const existing = await cartRepo.findOne({
      where: {
        user: { id: userId },
        status: CartStatus.OPEN,
        isActive: true,
        isArchived: false,
      },
      relations: ['user'],
    });

    if (existing) {
      return existing;
    }

    const cart = cartRepo.create({
      user: { id: userId } as any,
      status: CartStatus.OPEN,
      total: 0,
      createdBy: userId,
      lastChangedBy: userId,
    });

    return cartRepo.save(cart);
  }

  private async recalculateCartTotals(cartId: string, userId: string, manager?: EntityManager): Promise<void> {
    const itemRepo = manager?.getRepository(CartItem) ?? this.itemRepo;
    const cartRepo = manager?.getRepository(Cart) ?? this.cartRepo;

    const activeItems = await itemRepo.find({
      where: {
        cart: { id: cartId },
        isActive: true,
        isArchived: false,
      },
    });

    const total = activeItems.reduce((acc, item) => acc + Number(item.totalPrice), 0);
    await cartRepo.update({ id: cartId }, { total, lastChangedBy: userId });
  }

  private async loadCart(cartId: string, manager?: EntityManager): Promise<Cart> {
    const cartRepo = manager?.getRepository(Cart) ?? this.cartRepo;
    const cart = await cartRepo.findOne({
      where: { id: cartId },
      relations: ['items', 'items.product', 'user'],
    });

    if (!cart) {
      throw new NotFoundException(`Cart ${cartId} not found`);
    }

    cart.items = (cart.items ?? []).filter((item) => item.isActive && !item.isArchived);
    return cart;
  }
}

