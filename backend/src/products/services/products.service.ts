import { Inject, Injectable } from '@nestjs/common';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
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

  create(dto: CreateProductDto): Product {
    return this.repo.create(dto);
  }

  findAll(): Product[] {
    return this.repo.findAll();
  }

  findOne(id: string): Product {
    return this.repo.findOne(id);
  }

  update(id: string, dto: UpdateProductDto): Product {
    return this.repo.update(id, dto);
  }

  remove(id: string): void {
    return this.repo.remove(id);
  }
}
