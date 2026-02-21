import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Request } from './request.entity';
import { Item } from '../items/item.entity';

@Entity({ name: 'request_items' })
export class RequestItem {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @ManyToOne(() => Request, (request) => request.items)
  @JoinColumn({ name: 'request_id' })
  request!: Request;

  @ManyToOne(() => Item)
  @JoinColumn({ name: 'item_id' })
  item!: Item;

  @Column({ name: 'quantity', type: 'numeric' })
  quantity!: number;
}
