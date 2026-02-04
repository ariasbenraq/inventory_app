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

@Entity({ name: 'items' })
export class Item {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @Column({ name: 'name' })
  name!: string;

  @Column({ name: 'description', nullable: true })
  description?: string | null;

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
