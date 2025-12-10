import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('sys_users')
export class SysUser {
  @PrimaryGeneratedColumn('uuid', { name: 'user_id' })
  user_id: string;

  @Column({ name: 'username', length: 100, unique: true })
  username: string;

  @Column({ name: 'password', length: 255, select: false })
  password: string;

  @Column({ name: 'email', length: 150, nullable: true })
  email?: string | null;

  @Column({ name: 'phone', length: 20, nullable: true })
  phone?: string | null;

  @Column({ name: 'cccd', length: 12, nullable: true })
  cccd?: string | null;

  @Column({ name: 'is_active', default: true })
  is_active: boolean;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  created_at: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deleted_at?: Date | null;
}