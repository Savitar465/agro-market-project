import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ORDERS_REPOSITORY, SELLERS_SERVICE } from '../../common/tokens';
import {
  IOrdersRepository,
  OrderDateRange,
} from '../repositories/orders.repository.interface';
import { OrdersQueryDto } from '../dto/orders-query.dto';
import { IOrdersService } from './orders.service.interface';
import { Cart } from '../../cart/entities/cart.entity';
import { Order, OrderShipping } from '../entities/order.entity';
import {
  ORDER_STATUS_TRANSITIONS,
  OrderStatus,
} from '../entities/order-status.enum';
import { AuthenticatedUser } from '../../common/types/authenticated-user';
import { Role } from '../../auth/rbac/role.enum';
import { ISellerService } from '../../sellers/services/sellers.service.interface';

@Injectable()
export class OrdersService implements IOrdersService {
  constructor(
    @Inject(ORDERS_REPOSITORY)
    private readonly repo: IOrdersRepository,
    @Inject(SELLERS_SERVICE)
    private readonly sellersService: ISellerService,
  ) {}

  createFromCart(
    userId: string,
    cart: Cart,
    currency: string,
    shipping?: OrderShipping | null,
  ): Promise<Order> {
    return this.repo.createFromCart(userId, cart, currency, shipping);
  }

  attachPayment(orderId: string, paymentId: string): Promise<void> {
    return this.repo.attachPayment(orderId, paymentId);
  }

  async markPaidByPaymentId(paymentId: string): Promise<void> {
    const order = await this.repo.findByPaymentId(paymentId);
    if (!order || order.status === OrderStatus.PAID) {
      return;
    }
    await this.repo.setStatus(
      order.id,
      OrderStatus.PAID,
      order.userId,
      new Date(),
    );
  }

  async cancelByPaymentId(paymentId: string): Promise<void> {
    const order = await this.repo.findByPaymentId(paymentId);
    // Only a still-pending order may be auto-canceled; never touch a paid one.
    if (!order || order.status !== OrderStatus.PENDING_PAYMENT) {
      return;
    }
    await this.repo.setStatus(order.id, OrderStatus.CANCELED, order.userId);
  }

  findMine(userId: string, query?: OrdersQueryDto): Promise<Order[]> {
    return this.repo.findByUser(userId, this.toDateRange(query));
  }

  async findOneForUser(userId: string, orderId: string): Promise<Order> {
    const order = await this.repo.findOneForUser(userId, orderId);
    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }
    return order;
  }

  async findSales(
    user: AuthenticatedUser,
    query?: OrdersQueryDto,
  ): Promise<Order[]> {
    const range = this.toDateRange(query);
    if (this.isAdmin(user)) {
      return this.repo.findAll(range);
    }

    const seller = await this.sellersService.findByUserId(user.sub);
    if (!seller) {
      throw new ForbiddenException(
        'You need a seller profile to view incoming orders',
      );
    }
    return this.repo.findBySellerId(seller.id, range);
  }

  private toDateRange(query?: OrdersQueryDto): OrderDateRange | undefined {
    if (!query?.from && !query?.to) {
      return undefined;
    }
    const range: OrderDateRange = {};
    if (query.from) {
      range.from = new Date(query.from);
    }
    if (query.to) {
      const to = new Date(query.to);
      // A date-only upper bound is inclusive of that whole day.
      if (/^\d{4}-\d{2}-\d{2}$/.test(query.to)) {
        to.setUTCHours(23, 59, 59, 999);
      }
      range.to = to;
    }
    return range;
  }

  async updateStatus(
    orderId: string,
    status: OrderStatus,
    user: AuthenticatedUser,
  ): Promise<Order> {
    const order = await this.repo.findById(orderId);
    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    await this.assertCanFulfill(order, user);

    const allowed = ORDER_STATUS_TRANSITIONS[order.status] ?? [];
    if (status === order.status) {
      return order;
    }
    if (!allowed.includes(status)) {
      throw new ForbiddenException(
        `Cannot change order status from ${order.status} to ${status}`,
      );
    }

    return this.repo.setStatus(order.id, status, user.sub);
  }

  private isAdmin(user: AuthenticatedUser): boolean {
    return Boolean(user.roles?.includes(Role.Admin));
  }

  /** Admins manage any order; a seller only orders that include their product. */
  private async assertCanFulfill(
    order: Order,
    user: AuthenticatedUser,
  ): Promise<void> {
    if (this.isAdmin(user)) {
      return;
    }

    const seller = await this.sellersService.findByUserId(user.sub);
    const ownsLine =
      seller != null &&
      (order.items ?? []).some((item) => item.sellerId === seller.id);
    if (!ownsLine) {
      throw new ForbiddenException(
        'You can only manage orders that contain your products',
      );
    }
  }
}
