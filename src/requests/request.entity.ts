import {
  Column,
  Entity,
  JoinColumn,
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
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'requested_by' })
  createdBy!: User;

  @ManyToOne(() => Ministry)
  @JoinColumn({ name: 'ministry_id' })
  ministry!: Ministry;

  @Column({
    type: 'enum',
    enum: RequestStatus,
    enumName: 'request_status',
    default: RequestStatus.PENDING,
  })
  status!: RequestStatus;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt!: Date;

  @OneToMany(() => RequestItem, (item) => item.request, { cascade: true })
  items!: RequestItem[];
}
