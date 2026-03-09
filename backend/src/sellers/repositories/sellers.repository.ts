import { Injectable, NotFoundException } from '@nestjs/common';
import { Seller } from '../entities/seller.entity';
import { CreateSellerDto } from '../dto/create-seller.dto';
import { UpdateSellerDto } from '../dto/update-seller.dto';
import { ISellerRepository } from './sellers.repository.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SellersRepository implements ISellerRepository {
  constructor(
    @InjectRepository(Seller)
    private readonly repo: Repository<Seller>,
  ) {}

  async create(dto: CreateSellerDto, userId: string): Promise<Seller> {
    const seller: Seller = this.repo.create(dto);
    seller.createdBy = userId;
    seller.lastChangedBy = userId;
    return this.repo.save(seller);
  }

  async findAll(): Promise<Seller[]> {
    return this.repo.find({
      where: { isActive: true, isArchived: false },
      order: { createDateTime: 'DESC' },
      relations: ['user'],
    });
  }

  async findOne(id: string): Promise<Seller> {
    const seller = await this.repo.findOne({
      where: { id, isActive: true, isArchived: false },
      relations: ['user'],
    });
    if (!seller) throw new NotFoundException(`Seller ${id} not found`);
    return seller;
  }

  async update(id: string, dto: UpdateSellerDto, userId: string): Promise<Seller> {
    const seller = await this.findOne(id);
    Object.assign(seller, dto);
    seller.lastChangedBy = userId;
    return this.repo.save(seller);
  }

  async remove(id: string): Promise<void> {
    const seller = await this.findOne(id);
    seller.isActive = false;
    seller.isArchived = true;
    await this.repo.save(seller);
  }

  async findByUserId(userId: string): Promise<Seller | null> {
    return this.repo.findOne({
      where: { user: { id: userId }, isActive: true, isArchived: false },
      relations: ['user'],
    });
  }
}

