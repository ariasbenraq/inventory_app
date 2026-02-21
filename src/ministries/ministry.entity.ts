import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'ministries' })
export class Ministry {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @Column()
  name!: string;
}
