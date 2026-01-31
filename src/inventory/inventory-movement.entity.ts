import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Item } from '../items/item.entity';

export enum InventoryMovementType {
  IN = 'IN',
  OUT = 'OUT',
}

@Entity({ name: 'inventory_movements' })
export class InventoryMovement {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Item, (item) => item.movements)
  item!: Item;

  @Column({ name: 'movement_type', type: 'varchar' })
  movementType!: InventoryMovementType;

  @Column({ type: 'numeric' })
  quantity!: number;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt!: Date;
}
