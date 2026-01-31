import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Unit } from '../units/unit.entity';
import { InventoryMovement } from '../inventory/inventory-movement.entity';

@Entity({ name: 'items' })
export class Item {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'unit_id' })
  unitId!: string;

  @ManyToOne(() => Unit)
  @JoinColumn({ name: 'unit_id' })
  unit!: Unit;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @OneToMany(() => InventoryMovement, (movement) => movement.item)
  movements!: InventoryMovement[];
}
