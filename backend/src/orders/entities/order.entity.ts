import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/base/base.entity';
import { User } from '../../users/entities/user.entity';
import { Cart } from '../../cart/entities/cart.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { OrderStatus } from './order-status.enum';
import { OrderItem } from './order-item.entity';

/** Optional shipping details captured at checkout, snapshotted on the order. */
export interface OrderShipping {
  email?: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  city?: string;
  postalCode?: string;
}

@Entity()
export class Order extends BaseEntity {
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  userId: string;

  // The cart this order was created from (one order per purchased cart).
  @ManyToOne(() => Cart, { nullable: false })
  @JoinColumn({ name: 'cartId' })
  cart: Cart;

  @Column({ type: 'uuid' })
  cartId: string;

  @ManyToOne(() => Payment, { nullable: true })
  @JoinColumn({ name: 'paymentId' })
  payment?: Payment | null;

  @Column({ type: 'uuid', nullable: true })
  paymentId?: string | null;

  // Human-friendly reference shown to the buyer (e.g. AGM-LXY3K-4821).
  @Column({ type: 'varchar', length: 40 })
  orderNumber: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING_PAYMENT,
  })
  status: OrderStatus;

  @Column({ type: 'numeric', default: 0 })
  subtotal: number;

  @Column({ type: 'numeric', default: 0 })
  total: number;

  @Column({ type: 'varchar', length: 10, default: 'usd' })
  currency: string;

  @Column({ type: 'integer', default: 0 })
  itemCount: number;

  @Column({ type: 'jsonb', nullable: true })
  shipping?: OrderShipping | null;

  @Column({ type: 'timestamptz', nullable: true })
  paidAt?: Date | null;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items?: OrderItem[];
}
