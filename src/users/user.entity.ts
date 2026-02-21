import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from '../roles/role.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @Column({ unique: true })
  username!: string;

  @Column({ name: 'password_hash' })
  passwordHash!: string;

  @Column({ name: 'full_name' })
  fullName!: string;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ name: 'is_test_user', default: false })
  isTestUser!: boolean;

  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
  lastLoginAt!: Date | null;

  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles!: Role[];
}
