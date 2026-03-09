import { BaseEntity } from '../../common/base/base.entity';
import { Column, Entity, OneToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Seller extends BaseEntity {
  @Column({ type: 'varchar', length: 200 })
  name: string;
  @Column({ type: 'varchar', length: 200, nullable: true })
  location?: string;
  @OneToOne(() => User, user => user.id)
  user?: User;
  @Column({ type: 'jsonb', nullable: true })
  coords?: {
    lat: number;
    lng: number;
  };
}
