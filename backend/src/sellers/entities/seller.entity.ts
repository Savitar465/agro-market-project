import { BaseEntity } from '../../common/base/base.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Seller extends BaseEntity {
  @Column({ type: 'varchar', length: 200 })
  name: string;
  @Column({ type: 'varchar', length: 200, nullable: true })
  location?: string;
  @OneToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user?: User;
  @Column({ type: 'uuid', nullable: true })
  userId?: string;
  @Column({ type: 'jsonb', nullable: true })
  coords?: {
    lat: number;
    lng: number;
  };
}
