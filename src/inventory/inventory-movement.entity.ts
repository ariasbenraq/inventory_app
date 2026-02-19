import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Item } from '../items/item.entity';

export enum InventoryMovementType {
  IN = 'IN',
  OUT = 'OUT',
}

@Entity({ name: 'inventory_movements' })
export class InventoryMovement {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @Column({ name: 'item_id', type: 'bigint' })
  itemId!: string;

  @Column({ name: 'performed_by', type: 'bigint' })
  performedBy!: string;

  @ManyToOne(() => Item, (item) => item.movements)
  @JoinColumn({ name: 'item_id' })
  item!: Item;

  @Column({
    name: 'movement_type',
    type: 'enum',
    enum: InventoryMovementType,
    enumName: 'movement_type',
  })
  movementType!: InventoryMovementType;

  @Column({ type: 'numeric' })
  quantity!: number;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt!: Date;
}
