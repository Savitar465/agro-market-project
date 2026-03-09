import { AddCartItemDto } from '../dto/add-cart-item.dto';
import { UpdateCartItemDto } from '../dto/update-cart-item.dto';
import { Cart } from '../entities/cart.entity';

export interface ICartService {
  getOpenCart(userId: string): Promise<Cart>;
  addItem(userId: string, dto: AddCartItemDto): Promise<Cart>;
  updateItem(userId: string, itemId: string, dto: UpdateCartItemDto): Promise<Cart>;
  removeItem(userId: string, itemId: string): Promise<Cart>;
  clear(userId: string): Promise<Cart>;
  checkout(userId: string): Promise<Cart>;
}

