import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Unit } from '../units/unit.entity';
import { InventoryMovement } from '../inventory/inventory-movement.entity';

@Entity({ name: 'items' })
export class Item {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ name: 'base_unit_id' })
  baseUnitId!: string;

  @OneToMany(() => Unit, (unit) => unit.item)
  units!: Unit[];

  @OneToMany(() => InventoryMovement, (movement) => movement.item)
  movements!: InventoryMovement[];
}
