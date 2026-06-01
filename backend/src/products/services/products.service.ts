import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { FilterProductDto } from '../dto/filter-product.dto';
import { FilterProductBySellerDto } from '../dto/filter-product-by-seller.dto';
import { Product } from '../entities/product.entity';
import { ProductStatus } from '../entities/product-status.enum';
import { IProductRepository } from '../repositories/products.repository.interface';
import {
  PRODUCTS_REPOSITORY,
  SELLERS_SERVICE,
  USERS_SERVICE,
} from '../../common/tokens';
import { IProductsService } from './products.service.interface';
import { ISellerService } from '../../sellers/services/sellers.service.interface';
import { IUsersService } from '../../users/services/users.service.interface';
import { Seller } from '../../sellers/entities/seller.entity';
import { Role } from '../../auth/rbac/role.enum';
import { AuthenticatedUser } from '../../common/types/authenticated-user';

@Injectable()
export class ProductsService implements IProductsService {
  constructor(
    @Inject(PRODUCTS_REPOSITORY)
    private readonly repo: IProductRepository,
    @Inject(SELLERS_SERVICE)
    private readonly sellersService: ISellerService,
    @Inject(USERS_SERVICE)
    private readonly usersService: IUsersService,
  ) {}

  async create(
    dto: CreateProductDto,
    user: AuthenticatedUser,
  ): Promise<Product> {
    const payload: CreateProductDto = { ...dto };

    if (this.isAdmin(user)) {
      // Admins may target any seller explicitly (or leave it unassigned).
      payload.sellerId = dto.sellerId;
    } else {
      // Sellers can only create products under their own profile, regardless
      // of any sellerId supplied by the client.
      const seller = await this.ensureSellerForUser(user.sub);
      payload.sellerId = seller.id;
    }

    return this.repo.create(payload, user.sub);
  }

  findAll(): Promise<Product[]> {
    return this.repo.findAll();
  }

  findWithFilters(
    filters: FilterProductDto,
  ): Promise<{ data: Product[]; total: number; page: number; limit: number }> {
    return this.repo.findWithFilters(filters);
  }

  findBySeller(
    filters: FilterProductBySellerDto,
  ): Promise<{ data: Product[]; total: number; page: number; limit: number }> {
    return this.repo.findBySeller(filters);
  }

  async findMine(user: AuthenticatedUser): Promise<Product[]> {
    const seller = await this.sellersService.findByUserId(user.sub);
    if (!seller) {
      return [];
    }
    return this.repo.findInventoryBySeller(seller.id);
  }

  findOne(id: string): Promise<Product> {
    return this.repo.findOne(id);
  }

  async update(
    id: string,
    dto: UpdateProductDto,
    user: AuthenticatedUser,
  ): Promise<Product> {
    await this.assertCanManage(id, user);
    // Only admins may reassign a product to a different seller.
    const payload: UpdateProductDto = { ...dto };
    if (!this.isAdmin(user)) {
      delete payload.sellerId;
    }
    return this.repo.update(id, payload, user.sub);
  }

  async setStatus(
    id: string,
    status: ProductStatus,
    user: AuthenticatedUser,
  ): Promise<Product> {
    await this.assertCanManage(id, user);
    return this.repo.setStatus(id, status, user.sub);
  }

  async setStock(
    id: string,
    stock: number,
    user: AuthenticatedUser,
  ): Promise<Product> {
    await this.assertCanManage(id, user);
    return this.repo.setStock(id, stock, user.sub);
  }

  async remove(id: string, user: AuthenticatedUser): Promise<void> {
    await this.assertCanManage(id, user);
    return this.repo.remove(id);
  }

  private isAdmin(user: AuthenticatedUser): boolean {
    return Boolean(user.roles?.includes(Role.Admin));
  }

  /**
   * Returns the seller profile for the user, creating one on first use so that
   * a freshly-registered productor can immediately publish products.
   */
  private async ensureSellerForUser(userId: string): Promise<Seller> {
    const existing = await this.sellersService.findByUserId(userId);
    if (existing) {
      return existing;
    }
    const user = await this.usersService.findOne(userId);
    return this.sellersService.create({ name: user.name, userId }, userId);
  }

  /**
   * Throws unless the user is an admin or the seller that owns the product.
   * Returns the product so callers can reuse it.
   */
  private async assertCanManage(
    id: string,
    user: AuthenticatedUser,
  ): Promise<Product> {
    const product = await this.repo.findById(id);

    if (this.isAdmin(user)) {
      return product;
    }

    const seller = await this.sellersService.findByUserId(user.sub);
    if (!seller || product.sellerId !== seller.id) {
      throw new ForbiddenException('You can only manage your own products');
    }
    return product;
  }
}
