import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Request } from './request.entity';
import { Item } from '../items/item.entity';
import { Unit } from '../units/unit.entity';

@Entity({ name: 'request_items' })
export class RequestItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Request, (request) => request.items)
  request!: Request;

  @ManyToOne(() => Item)
  item!: Item;

  @ManyToOne(() => Unit)
  unit!: Unit;

  @Column({ name: 'quantity', type: 'numeric' })
  quantity!: number;
}
