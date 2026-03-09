import { Inject, Injectable } from '@nestjs/common';
import { CreateSellerDto } from '../dto/create-seller.dto';
import { UpdateSellerDto } from '../dto/update-seller.dto';
import { Seller } from '../entities/seller.entity';
import { ISellerRepository } from '../repositories/sellers.repository.interface';
import { SELLERS_REPOSITORY } from '../../common/tokens';
import { ISellerService } from './sellers.service.interface';

@Injectable()
export class SellersService implements ISellerService {
  constructor(
    @Inject(SELLERS_REPOSITORY)
    private readonly repo: ISellerRepository,
  ) {}

  create(dto: CreateSellerDto, userId: string): Promise<Seller> {
    return this.repo.create(dto, userId);
  }

  findAll(): Promise<Seller[]> {
    return this.repo.findAll();
  }

  findOne(id: string): Promise<Seller> {
    return this.repo.findOne(id);
  }

  update(id: string, dto: UpdateSellerDto, userId: string): Promise<Seller> {
    return this.repo.update(id, dto, userId);
  }

  remove(id: string): Promise<void> {
    return this.repo.remove(id);
  }

  findByUserId(userId: string): Promise<Seller | null> {
    return this.repo.findByUserId(userId);
  }
}

