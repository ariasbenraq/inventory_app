import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Unit } from '../units/unit.entity';
import { InventoryMovement } from '../inventory/inventory-movement.entity';
import { Brand } from './brand.entity';
import { ItemType } from './item-type.enum';

@Entity({ name: 'items' })
export class Item {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @Column({ name: 'name' })
  name!: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string | null;

  @Column({ name: 'brand_id', type: 'bigint', nullable: true })
  brandId?: string | null;

  @ManyToOne(() => Brand, (brand) => brand.items, { nullable: true })
  @JoinColumn({ name: 'brand_id' })
  brand?: Brand | null;

  @Column({ name: 'attributes', type: 'jsonb', nullable: true })
  attributes?: Record<string, string> | null;

  @Column({
    name: 'item_type',
    type: 'enum',
    enum: ItemType,
    enumName: 'item_type',
    default: ItemType.GENERAL,
  })
  itemType!: ItemType;

  @Column({ name: 'unit_id', type: 'bigint' })
  unitId!: string;

  @ManyToOne(() => Unit)
  @JoinColumn({ name: 'unit_id' })
  unit!: Unit;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => InventoryMovement, (movement) => movement.item)
  movements!: InventoryMovement[];
}
