import {BaseEntity} from "../../common/base/base.entity";
import { Column, Entity, ManyToOne, OneToOne } from 'typeorm';
import { Seller } from '../../sellers/entities/seller.entity';

@Entity()
export class Product extends BaseEntity {
  @Column({ type: 'varchar', length: 200 })
  name: string;
  @Column({ type: 'numeric' })
  price: number;
  @Column({ type: 'varchar', length: 200, nullable: true })
  unit?: string;
  @Column({ type: 'varchar', length: 200 })
  image: string;
  @Column({ type: 'varchar', length: 200, array: true, nullable: true })
  images?: string[];
  @Column({ type: 'text' })
  description: string;
  @Column({ type: 'varchar', length: 200 })
  category: string;
  @Column({ type: 'numeric', nullable: true })
  stock?: number;
  @Column({ type: 'numeric', nullable: true })
  rating?: number;
  @ManyToOne(() => Seller, seller => seller.id, { nullable: true })
  seller?: Seller;
}
