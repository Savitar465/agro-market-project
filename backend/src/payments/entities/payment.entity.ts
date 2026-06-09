import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../common/base/base.entity';
import { User } from '../../users/entities/user.entity';
import { Cart } from '../../cart/entities/cart.entity';
import { PaymentMethod, PaymentStatus } from './payment-status.enum';

@Entity()
export class Payment extends BaseEntity {
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => Cart, { nullable: false })
  @JoinColumn({ name: 'cartId' })
  cart: Cart;

  @Column({ type: 'uuid' })
  cartId: string;

  // The order this payment settles. Set right after the order is created.
  @Column({ type: 'uuid', nullable: true })
  orderId?: string | null;

  // 'stripe' for real Stripe sessions, 'mock' for the no-credentials dev flow.
  @Column({ type: 'varchar', length: 20, default: 'stripe' })
  provider: string;

  @Column({ type: 'enum', enum: PaymentMethod, default: PaymentMethod.CARD })
  method: PaymentMethod;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  // Stripe Checkout Session id (or a synthetic id in mock mode).
  @Column({ type: 'varchar', length: 255, nullable: true })
  sessionId?: string | null;

  // Hosted payment URL the buyer is sent to (also encoded as a QR for `qr`).
  @Column({ type: 'varchar', length: 1000, nullable: true })
  checkoutUrl?: string | null;

  @Column({ type: 'numeric', default: 0 })
  amount: number;

  @Column({ type: 'varchar', length: 10, default: 'usd' })
  currency: string;

  @Column({ type: 'timestamptz', nullable: true })
  paidAt?: Date | null;
}
