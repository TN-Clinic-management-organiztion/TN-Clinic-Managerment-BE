import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('system_audit_logs')
export class SystemAuditLog {
  @PrimaryGeneratedColumn('increment', {
    name: 'log_id',
    type: 'bigint',
  })
  log_id: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  user_id?: string | null;

  @Column({ name: 'action_type', length: 50, nullable: true })
  action_type?: string | null;

  @Column({ name: 'table_name', length: 50, nullable: true })
  table_name?: string | null;

  @Column({ name: 'record_id', length: 50, nullable: true })
  record_id?: string | null;

  @Column({ name: 'old_value', type: 'jsonb', nullable: true })
  old_value?: any;

  @Column({ name: 'new_value', type: 'jsonb', nullable: true })
  new_value?: any;

  @Column({ name: 'ip_address', type: 'inet', nullable: true })
  ip_address?: string | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  created_at: Date;
}