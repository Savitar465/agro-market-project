import { Injectable, NotFoundException } from '@nestjs/common';
import { Product } from '../entities/product.entity';
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
    const product: Product = this.repo.create(dto);
    product.createdBy = userId;
    product.lastChangedBy = userId;
    return this.repo.save(product);
  }

  async findAll(): Promise<Product[]> {
    return this.repo.find({
      where: { isActive: true, isArchived: false },
      order: { createDateTime: 'DESC' },
      relations: ['seller'],
    });
  }

  async findWithFilters(filters: FilterProductDto): Promise<{ data: Product[]; total: number; page: number; limit: number }> {
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

    // Load seller relation
    queryBuilder.leftJoinAndSelect('product.seller', 'seller');

    // Base filters - only active and non-archived products
    queryBuilder.where('product.isActive = :isActive', { isActive: true });
    queryBuilder.andWhere('product.isArchived = :isArchived', { isArchived: false });

    // Name filter (partial match, case insensitive)
    if (name) {
      queryBuilder.andWhere('LOWER(product.name) LIKE LOWER(:name)', { name: `%${name}%` });
    }

    // Category filter (exact match, case insensitive)
    if (category) {
      queryBuilder.andWhere('LOWER(product.category) = LOWER(:category)', { category });
    }

    // Price range filters
    if (minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
    }
    if (maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    // Rating filter
    if (minRating !== undefined) {
      queryBuilder.andWhere('product.rating >= :minRating', { minRating });
    }

    // Stock filter
    if (minStock !== undefined) {
      queryBuilder.andWhere('product.stock >= :minStock', { minStock });
    }

    // Unit filter
    if (unit) {
      queryBuilder.andWhere('LOWER(product.unit) = LOWER(:unit)', { unit });
    }

    // Sorting
    const validSortFields = ['name', 'price', 'rating', 'createDateTime', 'category', 'stock'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createDateTime';
    queryBuilder.orderBy(`product.${sortField}`, sortOrder);

    // Count total before pagination
    const total = await queryBuilder.getCount();

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Execute query
    const data = await queryBuilder.getMany();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.repo.findOne({
      where: { id, isActive: true, isArchived: false },
      relations: ['seller'],
    });
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return product;
  }

  async update(id: string, dto: UpdateProductDto, userId: string): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, dto);
    product.lastChangedBy = userId;
    return this.repo.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    product.isActive = false;
    product.isArchived = true;
    await this.repo.save(product);
  }

  async findBySeller(filters: FilterProductBySellerDto): Promise<{ data: Product[]; total: number; page: number; limit: number }> {
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

    // Load seller relation
    queryBuilder.leftJoinAndSelect('product.seller', 'seller');

    // Base filters - only active and non-archived products
    queryBuilder.where('product.isActive = :isActive', { isActive: true });
    queryBuilder.andWhere('product.isArchived = :isArchived', { isArchived: false });

    // Seller filter
    if (sellerId) {
      queryBuilder.andWhere('product.sellerId = :sellerId', { sellerId });
    }

    // Name filter (partial match, case insensitive)
    if (name) {
      queryBuilder.andWhere('LOWER(product.name) LIKE LOWER(:name)', { name: `%${name}%` });
    }

    // Category filter (exact match, case insensitive)
    if (category) {
      queryBuilder.andWhere('LOWER(product.category) = LOWER(:category)', { category });
    }

    // Price range filters
    if (minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
    }
    if (maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    // Sorting
    const validSortFields = ['name', 'price', 'rating', 'createDateTime', 'category', 'stock'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createDateTime';
    queryBuilder.orderBy(`product.${sortField}`, sortOrder);

    // Count total before pagination
    const total = await queryBuilder.getCount();

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Execute query
    const data = await queryBuilder.getMany();

    return {
      data,
      total,
      page,
      limit,
    };
  }
}
