import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'ministries' })
export class Ministry {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;
}
