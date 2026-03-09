import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/base/base.entity';
import { User } from '../../users/entities/user.entity';
import { CartStatus } from './cart-status.enum';
import { CartItem } from './cart-item.entity';

@Entity()
export class Cart extends BaseEntity {
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'enum', enum: CartStatus, default: CartStatus.OPEN })
  status: CartStatus;

  @Column({ type: 'numeric', default: 0 })
  total: number;

  @Column({ type: 'timestamptz', nullable: true })
  purchasedAt?: Date | null;

  @OneToMany(() => CartItem, (item) => item.cart)
  items?: CartItem[];
}

