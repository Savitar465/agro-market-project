import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { Product } from '../entities/product.entity';

export interface IProductsService {
  create(dto: CreateProductDto): Product;
  findAll(): Product[];
  findOne(id: string): Product;
  update(id: string, dto: UpdateProductDto): Product;
  remove(id: string): void;
}
