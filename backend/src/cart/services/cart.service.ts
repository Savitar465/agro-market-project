import { Inject, Injectable } from '@nestjs/common';
import { CART_REPOSITORY } from '../../common/tokens';
import { ICartService } from './cart.service.interface';
import { ICartRepository } from '../repositories/cart.repository.interface';
import { Cart } from '../entities/cart.entity';
import { AddCartItemDto } from '../dto/add-cart-item.dto';
import { UpdateCartItemDto } from '../dto/update-cart-item.dto';

@Injectable()
export class CartService implements ICartService {
  constructor(
    @Inject(CART_REPOSITORY)
    private readonly repo: ICartRepository,
  ) {}

  getOpenCart(userId: string): Promise<Cart> {
    return this.repo.getOpenCart(userId);
  }

  addItem(userId: string, dto: AddCartItemDto): Promise<Cart> {
    return this.repo.addItem(userId, dto);
  }

  updateItem(userId: string, itemId: string, dto: UpdateCartItemDto): Promise<Cart> {
    return this.repo.updateItem(userId, itemId, dto);
  }

  removeItem(userId: string, itemId: string): Promise<Cart> {
    return this.repo.removeItem(userId, itemId);
  }

  clear(userId: string): Promise<Cart> {
    return this.repo.clear(userId);
  }

  checkout(userId: string): Promise<Cart> {
    return this.repo.checkout(userId);
  }
}

