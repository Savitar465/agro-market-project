import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { FilterProductDto } from '../dto/filter-product.dto';
import { FilterProductBySellerDto } from '../dto/filter-product-by-seller.dto';
import { Product } from '../entities/product.entity';
import { ProductStatus } from '../entities/product-status.enum';
import { AuthenticatedUser } from '../../common/types/authenticated-user';

export interface IProductsService {
  create(dto: CreateProductDto, user: AuthenticatedUser): Promise<Product>;
  findAll(): Promise<Product[]>;
  findWithFilters(
    filters: FilterProductDto,
  ): Promise<{ data: Product[]; total: number; page: number; limit: number }>;
  findBySeller(
    filters: FilterProductBySellerDto,
  ): Promise<{ data: Product[]; total: number; page: number; limit: number }>;
  findMine(user: AuthenticatedUser): Promise<Product[]>;
  findOne(id: string): Promise<Product>;
  update(
    id: string,
    dto: UpdateProductDto,
    user: AuthenticatedUser,
  ): Promise<Product>;
  setStatus(
    id: string,
    status: ProductStatus,
    user: AuthenticatedUser,
  ): Promise<Product>;
  setStock(
    id: string,
    stock: number,
    user: AuthenticatedUser,
  ): Promise<Product>;
  remove(id: string, user: AuthenticatedUser): Promise<void>;
}
