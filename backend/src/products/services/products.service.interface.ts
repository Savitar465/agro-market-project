import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { FilterProductDto } from '../dto/filter-product.dto';
import { Product } from '../entities/product.entity';

export interface IProductsService {
  create(dto: CreateProductDto, userId: string): Promise<Product>;
  findAll(): Promise<Product[]>;
  findWithFilters(filters: FilterProductDto): Promise<{ data: Product[]; total: number; page: number; limit: number }>;
  findOne(id: string): Promise<Product>;
  update(id: string, dto: UpdateProductDto, userId: string): Promise<Product>;
  remove(id: string): Promise<void>;
}
