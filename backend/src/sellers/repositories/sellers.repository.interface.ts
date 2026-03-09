import { CreateSellerDto } from '../dto/create-seller.dto';
import { UpdateSellerDto } from '../dto/update-seller.dto';
import { Seller } from '../entities/seller.entity';

export interface ISellerRepository {
  create(dto: CreateSellerDto, userId: string): Promise<Seller>;
  findAll(): Promise<Seller[]>;
  findOne(id: string): Promise<Seller>;
  update(id: string, dto: UpdateSellerDto, userId: string): Promise<Seller>;
  remove(id: string): Promise<void>;
  findByUserId(userId: string): Promise<Seller | null>;
}

