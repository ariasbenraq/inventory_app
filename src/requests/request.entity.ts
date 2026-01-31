import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Ministry } from '../ministries/ministry.entity';
import { RequestItem } from './request-item.entity';
import { RequestStatus } from './request-status.enum';

@Entity({ name: 'requests' })
export class Request {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User)
  createdBy!: User;

  @ManyToOne(() => Ministry)
  ministry!: Ministry;

  @Column({ type: 'varchar', default: RequestStatus.PENDING })
  status!: RequestStatus;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt!: Date;

  @OneToMany(() => RequestItem, (item) => item.request, { cascade: true })
  items!: RequestItem[];
}
