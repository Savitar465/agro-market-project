import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { CreateSellerDto } from '../dto/create-seller.dto';
import { UpdateSellerDto } from '../dto/update-seller.dto';
import { Seller } from '../entities/seller.entity';
import { ISellerRepository } from '../repositories/sellers.repository.interface';
import { SELLERS_REPOSITORY } from '../../common/tokens';
import { ISellerService } from './sellers.service.interface';
import { Role } from '../../auth/rbac/role.enum';
import { AuthenticatedUser } from '../../common/types/authenticated-user';

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

  async update(
    id: string,
    dto: UpdateSellerDto,
    user: AuthenticatedUser,
  ): Promise<Seller> {
    await this.assertCanManage(id, user);
    return this.repo.update(id, dto, user.sub);
  }

  async remove(id: string, user: AuthenticatedUser): Promise<void> {
    await this.assertCanManage(id, user);
    return this.repo.remove(id);
  }

  findByUserId(userId: string): Promise<Seller | null> {
    return this.repo.findByUserId(userId);
  }

  private isAdmin(user: AuthenticatedUser): boolean {
    return Boolean(user.roles?.includes(Role.Admin));
  }

  /**
   * Throws unless the user is an admin or the owner of the seller profile.
   * Returns the seller so callers can reuse it.
   */
  private async assertCanManage(
    id: string,
    user: AuthenticatedUser,
  ): Promise<Seller> {
    const seller = await this.repo.findOne(id);

    if (this.isAdmin(user)) {
      return seller;
    }

    if (seller.userId !== user.sub) {
      throw new ForbiddenException('You can only manage your own seller profile');
    }
    return seller;
  }
}
