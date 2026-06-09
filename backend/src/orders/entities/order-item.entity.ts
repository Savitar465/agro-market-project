import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../common/base/base.entity';
import { Order } from './order.entity';
import { Product } from '../../products/entities/product.entity';
import { Seller } from '../../sellers/entities/seller.entity';

/**
 * Immutable snapshot of a purchased line. Name/price/image are copied from the
 * product at purchase time so the order history stays accurate even if the
 * product is later edited, suspended or deleted.
 */
@Entity()
export class OrderItem extends BaseEntity {
  @ManyToOne(() => Order, (order) => order.items, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column({ type: 'uuid' })
  orderId: string;

  @ManyToOne(() => Product, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'productId' })
  product?: Product | null;

  @Column({ type: 'uuid', nullable: true })
  productId?: string | null;

  // Snapshot of the owning seller, kept for the seller "incoming orders" view.
  @ManyToOne(() => Seller, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'sellerId' })
  seller?: Seller | null;

  @Column({ type: 'uuid', nullable: true })
  sellerId?: string | null;

  @Column({ type: 'varchar', length: 200 })
  productName: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  unit?: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  image?: string | null;

  @Column({ type: 'numeric' })
  unitPrice: number;

  @Column({ type: 'integer' })
  quantity: number;

  @Column({ type: 'numeric' })
  totalPrice: number;
}
