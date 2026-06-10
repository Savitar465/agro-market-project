import { Cart } from '../../cart/entities/cart.entity';
import { Order, OrderShipping } from '../entities/order.entity';
import { OrderStatus } from '../entities/order-status.enum';

/** Inclusive bounds on the order creation date. */
export interface OrderDateRange {
  from?: Date;
  to?: Date;
}

export interface IOrdersRepository {
  createFromCart(
    userId: string,
    cart: Cart,
    currency: string,
    shipping?: OrderShipping | null,
  ): Promise<Order>;
  attachPayment(orderId: string, paymentId: string): Promise<void>;
  findById(orderId: string): Promise<Order | null>;
  findByPaymentId(paymentId: string): Promise<Order | null>;
  findByUser(userId: string, range?: OrderDateRange): Promise<Order[]>;
  findOneForUser(userId: string, orderId: string): Promise<Order | null>;
  findBySellerId(sellerId: string, range?: OrderDateRange): Promise<Order[]>;
  findAll(range?: OrderDateRange): Promise<Order[]>;
  setStatus(
    orderId: string,
    status: OrderStatus,
    changedBy: string,
    paidAt?: Date | null,
  ): Promise<Order>;
}
