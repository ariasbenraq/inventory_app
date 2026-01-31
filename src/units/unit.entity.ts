import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Item } from '../items/item.entity';

@Entity({ name: 'units' })
export class Unit {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: number;

  @Column({ name: 'code' })
  code!: string;

  @Column({ type: 'numeric' })
  factor!: number;

  @OneToMany(() => Item, (item) => item.unit)
  items!: Item[];
}
