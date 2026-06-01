import { CreateSellerDto } from '../dto/create-seller.dto';
import { UpdateSellerDto } from '../dto/update-seller.dto';
import { Seller } from '../entities/seller.entity';
import { AuthenticatedUser } from '../../common/types/authenticated-user';

export interface ISellerService {
  create(dto: CreateSellerDto, userId: string): Promise<Seller>;
  findAll(): Promise<Seller[]>;
  findOne(id: string): Promise<Seller>;
  update(
    id: string,
    dto: UpdateSellerDto,
    user: AuthenticatedUser,
  ): Promise<Seller>;
  remove(id: string, user: AuthenticatedUser): Promise<void>;
  findByUserId(userId: string): Promise<Seller | null>;
}
