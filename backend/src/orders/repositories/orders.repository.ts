import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { Order, OrderShipping } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { Cart } from '../../cart/entities/cart.entity';
import { OrderStatus } from '../entities/order-status.enum';
import { IOrdersRepository } from './orders.repository.interface';

const ORDER_RELATIONS = [
  'items',
  'items.product',
  'items.seller',
  'payment',
  'user',
];

@Injectable()
export class OrdersRepository implements IOrdersRepository {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly itemRepo: Repository<OrderItem>,
  ) {}

  async createFromCart(
    userId: string,
    cart: Cart,
    currency: string,
    shipping?: OrderShipping | null,
  ): Promise<Order> {
    const activeItems = (cart.items ?? []).filter(
      (item) => item.isActive && !item.isArchived,
    );

    const subtotal = activeItems.reduce(
      (acc, item) => acc + Number(item.totalPrice),
      0,
    );
    const itemCount = activeItems.reduce(
      (acc, item) => acc + Number(item.quantity),
      0,
    );

    // One order per cart: reuse the existing pending order on a retried
    // checkout so abandoned attempts don't pile up in the buyer's history.
    const existing = await this.orderRepo.findOne({
      where: { cartId: cart.id, status: Not(OrderStatus.CANCELED) },
      relations: ['items'],
    });

    if (existing && existing.status !== OrderStatus.PENDING_PAYMENT) {
      // Already paid/being fulfilled — never mutate a settled order.
      return this.findByIdOrThrow(existing.id);
    }

    if (existing) {
      await this.itemRepo.delete({ orderId: existing.id });
      existing.subtotal = subtotal;
      existing.total = subtotal;
      existing.currency = currency;
      existing.itemCount = itemCount;
      existing.shipping = shipping ?? existing.shipping ?? null;
      existing.lastChangedBy = userId;
      existing.items = this.buildItems(activeItems, userId);
      await this.orderRepo.save(existing);
      return this.findByIdOrThrow(existing.id);
    }

    const order = this.orderRepo.create({
      userId,
      cartId: cart.id,
      orderNumber: this.generateOrderNumber(),
      status: OrderStatus.PENDING_PAYMENT,
      subtotal,
      total: subtotal,
      currency,
      itemCount,
      shipping: shipping ?? null,
      createdBy: userId,
      lastChangedBy: userId,
      items: this.buildItems(activeItems, userId),
    });
    const saved = await this.orderRepo.save(order);
    return this.findByIdOrThrow(saved.id);
  }

  async attachPayment(orderId: string, paymentId: string): Promise<void> {
    await this.orderRepo.update({ id: orderId }, { paymentId });
  }

  findById(orderId: string): Promise<Order | null> {
    return this.orderRepo.findOne({
      where: { id: orderId },
      relations: ORDER_RELATIONS,
    });
  }

  findByPaymentId(paymentId: string): Promise<Order | null> {
    return this.orderRepo.findOne({
      where: { paymentId },
      relations: ORDER_RELATIONS,
    });
  }

  findByUser(userId: string): Promise<Order[]> {
    return this.orderRepo.find({
      where: { userId, isActive: true, isArchived: false },
      relations: ORDER_RELATIONS,
      order: { createDateTime: 'DESC' },
    });
  }

  findOneForUser(userId: string, orderId: string): Promise<Order | null> {
    return this.orderRepo.findOne({
      where: { id: orderId, userId },
      relations: ORDER_RELATIONS,
    });
  }

  async findBySellerId(sellerId: string): Promise<Order[]> {
    // Distinct orders that contain at least one line owned by this seller,
    // excluding the orders that were never paid.
    const ids = await this.itemRepo
      .createQueryBuilder('item')
      .select('DISTINCT item.orderId', 'orderId')
      .innerJoin('item.order', 'order')
      .where('item.sellerId = :sellerId', { sellerId })
      .andWhere('order.status != :pending', {
        pending: OrderStatus.PENDING_PAYMENT,
      })
      .getRawMany<{ orderId: string }>();

    if (ids.length === 0) {
      return [];
    }

    return this.orderRepo.find({
      where: { id: In(ids.map((row) => row.orderId)) },
      relations: ORDER_RELATIONS,
      order: { createDateTime: 'DESC' },
    });
  }

  findAll(): Promise<Order[]> {
    return this.orderRepo.find({
      where: { status: Not(OrderStatus.PENDING_PAYMENT) },
      relations: ORDER_RELATIONS,
      order: { createDateTime: 'DESC' },
    });
  }

  async setStatus(
    orderId: string,
    status: OrderStatus,
    changedBy: string,
    paidAt?: Date | null,
  ): Promise<Order> {
    const order = await this.findByIdOrThrow(orderId);
    order.status = status;
    order.lastChangedBy = changedBy;
    if (paidAt !== undefined) {
      order.paidAt = paidAt;
    }
    await this.orderRepo.save(order);
    return this.findByIdOrThrow(orderId);
  }

  private buildItems(
    cartItems: Cart['items'] = [],
    userId: string,
  ): OrderItem[] {
    return (cartItems ?? []).map((item) =>
      this.itemRepo.create({
        productId: item.product?.id ?? null,
        sellerId: item.product?.sellerId ?? null,
        productName: item.product?.name ?? 'Producto',
        unit: item.product?.unit ?? null,
        image: item.product?.image ?? null,
        unitPrice: Number(item.unitPrice),
        quantity: Number(item.quantity),
        totalPrice: Number(item.totalPrice),
        createdBy: userId,
        lastChangedBy: userId,
      }),
    );
  }

  private async findByIdOrThrow(orderId: string): Promise<Order> {
    const order = await this.findById(orderId);
    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }
    return order;
  }

  private generateOrderNumber(): string {
    const time = Date.now().toString(36).toUpperCase();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `AGM-${time}-${random}`;
  }
}
