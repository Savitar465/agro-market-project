import { Inject, Injectable } from '@nestjs/common';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { FilterProductDto } from '../dto/filter-product.dto';
import { FilterProductBySellerDto } from '../dto/filter-product-by-seller.dto';
import { Product } from '../entities/product.entity';
import { IProductRepository } from '../repositories/products.repository.interface';
import { PRODUCTS_REPOSITORY } from '../../common/tokens';
import { IProductsService } from './products.service.interface';

@Injectable()
export class ProductsService implements IProductsService {
  constructor(
    @Inject(PRODUCTS_REPOSITORY)
    private readonly repo: IProductRepository,
  ) {}

  create(dto: CreateProductDto, userId: string): Promise<Product> {
    return this.repo.create(dto, userId);
  }

  findAll(): Promise<Product[]> {
    return this.repo.findAll();
  }

  findWithFilters(filters: FilterProductDto): Promise<{ data: Product[]; total: number; page: number; limit: number }> {
    return this.repo.findWithFilters(filters);
  }

  findBySeller(filters: FilterProductBySellerDto): Promise<{ data: Product[]; total: number; page: number; limit: number }> {
    return this.repo.findBySeller(filters);
  }

  findOne(id: string): Promise<Product> {
    return this.repo.findOne(id);
  }

  update(id: string, dto: UpdateProductDto, userId: string): Promise<Product> {
    return this.repo.update(id, dto, userId);
  }

  remove(id: string): Promise<void> {
    return this.repo.remove(id);
  }
}
