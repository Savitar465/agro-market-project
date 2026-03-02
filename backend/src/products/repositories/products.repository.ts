import { Injectable, NotFoundException } from '@nestjs/common';
import { Product } from '../entities/product.entity';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { IProductRepository } from './products.repository.interface';

@Injectable()
export class ProductsRepository implements IProductRepository {
  private readonly products: Product[] = [];
  private nextId = '1';

  create(dto: CreateProductDto): Product {
    const product: Product = { id: this.nextId, ...dto };
    this.products.push(product);
    return product;
  }

  findAll(): Product[] {
    return [...this.products];
  }

  findOne(id: string): Product {
    const product = this.products.find((p) => p.id === id);
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return product;
  }

  update(id: string, dto: UpdateProductDto): Product {
    const product = this.findOne(id);
    Object.assign(product, dto);
    return product;
  }

  remove(id: string): void {
    const idx = this.products.findIndex((p) => p.id === id);
    if (idx === -1) throw new NotFoundException(`Product ${id} not found`);
    this.products.splice(idx, 1);
  }
}
