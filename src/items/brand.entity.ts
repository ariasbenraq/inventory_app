import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Item } from './item.entity';

@Entity({ name: 'brands' })
export class Brand {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @Column({ name: 'name', unique: true })
  name!: string;

  @OneToMany(() => Item, (item) => item.brand)
  items!: Item[];
}
