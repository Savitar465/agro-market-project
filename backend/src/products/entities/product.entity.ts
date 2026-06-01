import { BaseEntity } from '../../common/base/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Seller } from '../../sellers/entities/seller.entity';
import { ProductStatus } from './product-status.enum';

@Entity()
export class Product extends BaseEntity {
  @Column({ type: 'varchar', length: 200 })
  name: string;
  @Column({ type: 'numeric' })
  price: number;
  @Column({ type: 'varchar', length: 200, nullable: true })
  unit?: string;
  @Column({ type: 'varchar', length: 500 })
  image: string;
  @Column({ type: 'varchar', length: 500, array: true, nullable: true })
  images?: string[];
  @Column({ type: 'text' })
  description: string;
  @Column({ type: 'varchar', length: 200 })
  category: string;
  @Column({ type: 'numeric', nullable: true })
  stock?: number;
  @Column({ type: 'numeric', nullable: true })
  rating?: number;
  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.Published,
  })
  status: ProductStatus;
  @ManyToOne(() => Seller, { nullable: true })
  @JoinColumn({ name: 'sellerId' })
  seller?: Seller;
  @Column({ type: 'uuid', nullable: true })
  sellerId?: string;
}
