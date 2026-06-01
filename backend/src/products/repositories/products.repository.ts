import { Injectable, NotFoundException } from '@nestjs/common';
import { Product } from '../entities/product.entity';
import { ProductStatus } from '../entities/product-status.enum';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { FilterProductDto } from '../dto/filter-product.dto';
import { FilterProductBySellerDto } from '../dto/filter-product-by-seller.dto';
import { IProductRepository } from './products.repository.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ProductsRepository implements IProductRepository {
  constructor(
    @InjectRepository(Product)
    private readonly repo: Repository<Product>,
  ) {}

  async create(dto: CreateProductDto, userId: string): Promise<Product> {
    const { sellerId, ...rest } = dto;
    const product: Product = this.repo.create(rest);
    if (sellerId) {
      product.sellerId = sellerId;
    }
    product.createdBy = userId;
    product.lastChangedBy = userId;
    const saved = await this.repo.save(product);
    return this.findOne(saved.id);
  }

  async findAll(): Promise<Product[]> {
    return this.repo.find({
      where: {
        isActive: true,
        isArchived: false,
        status: ProductStatus.Published,
      },
      order: { createDateTime: 'DESC' },
      relations: ['seller'],
    });
  }

  async findWithFilters(
    filters: FilterProductDto,
  ): Promise<{ data: Product[]; total: number; page: number; limit: number }> {
    const {
      name,
      category,
      minPrice,
      maxPrice,
      minRating,
      minStock,
      unit,
      sortBy = 'createDateTime',
      sortOrder = 'DESC',
      page = 1,
      limit = 10,
    } = filters;

    const queryBuilder = this.repo.createQueryBuilder('product');
    queryBuilder.leftJoinAndSelect('product.seller', 'seller');

    // Public catalog: only active, non-archived, published products.
    queryBuilder.where('product.isActive = :isActive', { isActive: true });
    queryBuilder.andWhere('product.isArchived = :isArchived', {
      isArchived: false,
    });
    queryBuilder.andWhere('product.status = :status', {
      status: ProductStatus.Published,
    });

    if (name) {
      queryBuilder.andWhere('LOWER(product.name) LIKE LOWER(:name)', {
        name: `%${name}%`,
      });
    }
    if (category) {
      queryBuilder.andWhere('LOWER(product.category) = LOWER(:category)', {
        category,
      });
    }
    if (minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
    }
    if (maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
    }
    if (minRating !== undefined) {
      queryBuilder.andWhere('product.rating >= :minRating', { minRating });
    }
    if (minStock !== undefined) {
      queryBuilder.andWhere('product.stock >= :minStock', { minStock });
    }
    if (unit) {
      queryBuilder.andWhere('LOWER(product.unit) = LOWER(:unit)', { unit });
    }

    const sortField = this.resolveSortField(sortBy);
    queryBuilder.orderBy(`product.${sortField}`, sortOrder);

    const total = await queryBuilder.getCount();
    queryBuilder.skip((page - 1) * limit).take(limit);
    const data = await queryBuilder.getMany();

    return { data, total, page, limit };
  }

  async findBySeller(
    filters: FilterProductBySellerDto,
  ): Promise<{ data: Product[]; total: number; page: number; limit: number }> {
    const {
      sellerId,
      name,
      category,
      minPrice,
      maxPrice,
      sortBy = 'createDateTime',
      sortOrder = 'DESC',
      page = 1,
      limit = 10,
    } = filters;

    const queryBuilder = this.repo.createQueryBuilder('product');
    queryBuilder.leftJoinAndSelect('product.seller', 'seller');

    // Public seller storefront: only published products.
    queryBuilder.where('product.isActive = :isActive', { isActive: true });
    queryBuilder.andWhere('product.isArchived = :isArchived', {
      isArchived: false,
    });
    queryBuilder.andWhere('product.status = :status', {
      status: ProductStatus.Published,
    });

    if (sellerId) {
      queryBuilder.andWhere('product.sellerId = :sellerId', { sellerId });
    }
    if (name) {
      queryBuilder.andWhere('LOWER(product.name) LIKE LOWER(:name)', {
        name: `%${name}%`,
      });
    }
    if (category) {
      queryBuilder.andWhere('LOWER(product.category) = LOWER(:category)', {
        category,
      });
    }
    if (minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
    }
    if (maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    const sortField = this.resolveSortField(sortBy);
    queryBuilder.orderBy(`product.${sortField}`, sortOrder);

    const total = await queryBuilder.getCount();
    queryBuilder.skip((page - 1) * limit).take(limit);
    const data = await queryBuilder.getMany();

    return { data, total, page, limit };
  }

  /** Seller inventory: every non-archived product owned by the seller, any status. */
  async findInventoryBySeller(sellerId: string): Promise<Product[]> {
    return this.repo.find({
      where: { sellerId, isActive: true, isArchived: false },
      order: { createDateTime: 'DESC' },
      relations: ['seller'],
    });
  }

  /** Public lookup — only returns published products. */
  async findOne(id: string): Promise<Product> {
    const product = await this.repo.findOne({
      where: {
        id,
        isActive: true,
        isArchived: false,
        status: ProductStatus.Published,
      },
      relations: ['seller'],
    });
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return product;
  }

  /** Management lookup — returns the product regardless of publication status. */
  async findById(id: string): Promise<Product> {
    const product = await this.repo.findOne({
      where: { id, isActive: true, isArchived: false },
      relations: ['seller'],
    });
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return product;
  }

  async update(
    id: string,
    dto: UpdateProductDto,
    userId: string,
  ): Promise<Product> {
    const product = await this.findById(id);
    Object.assign(product, dto);
    product.lastChangedBy = userId;
    await this.repo.save(product);
    return this.findById(id);
  }

  async setStatus(
    id: string,
    status: ProductStatus,
    userId: string,
  ): Promise<Product> {
    const product = await this.findById(id);
    product.status = status;
    product.lastChangedBy = userId;
    return this.repo.save(product);
  }

  async setStock(id: string, stock: number, userId: string): Promise<Product> {
    const product = await this.findById(id);
    product.stock = stock;
    product.lastChangedBy = userId;
    return this.repo.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findById(id);
    product.isActive = false;
    product.isArchived = true;
    await this.repo.save(product);
  }

  private resolveSortField(sortBy: string): string {
    const validSortFields = [
      'name',
      'price',
      'rating',
      'createDateTime',
      'category',
      'stock',
    ];
    return validSortFields.includes(sortBy) ? sortBy : 'createDateTime';
  }
}
