import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'units' })
export class Unit {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @Column({ name: 'code' })
  code!: string;

  @Column({ type: 'numeric' })
  factor!: number;
}
