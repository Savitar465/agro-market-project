import { Cart } from '../../cart/entities/cart.entity';
import { Order, OrderShipping } from '../entities/order.entity';
import { OrderStatus } from '../entities/order-status.enum';
import { AuthenticatedUser } from '../../common/types/authenticated-user';
import { OrdersQueryDto } from '../dto/orders-query.dto';

export interface IOrdersService {
  /**
   * Creates (or refreshes) the PENDING_PAYMENT order for a cart at checkout
   * time. One order is kept per cart, so retried checkout sessions reuse it.
   */
  createFromCart(
    userId: string,
    cart: Cart,
    currency: string,
    shipping?: OrderShipping | null,
  ): Promise<Order>;

  /** Links the payment that will settle this order. */
  attachPayment(orderId: string, paymentId: string): Promise<void>;

  /** Marks the order tied to a payment as PAID (idempotent). */
  markPaidByPaymentId(paymentId: string): Promise<void>;

  /** Cancels the still-pending order tied to a payment (idempotent). */
  cancelByPaymentId(paymentId: string): Promise<void>;

  /** Order history for the authenticated buyer, newest first. */
  findMine(userId: string, query?: OrdersQueryDto): Promise<Order[]>;

  /** A single order owned by the buyer (status + confirmation details). */
  findOneForUser(userId: string, orderId: string): Promise<Order>;

  /** Orders containing products of the authenticated seller (or all, admin). */
  findSales(user: AuthenticatedUser, query?: OrdersQueryDto): Promise<Order[]>;

  /** Advances the fulfillment status (seller/admin only). */
  updateStatus(
    orderId: string,
    status: OrderStatus,
    user: AuthenticatedUser,
  ): Promise<Order>;
}
