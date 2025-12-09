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
  logId: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId?: string;

  @Column({ name: 'action_type', length: 50, nullable: true })
  actionType?: string;

  @Column({ name: 'table_name', length: 50, nullable: true })
  tableName?: string;

  @Column({ name: 'record_id', length: 50, nullable: true })
  recordId?: string;

  @Column({ name: 'old_value', type: 'jsonb', nullable: true })
  oldValue?: any;

  @Column({ name: 'new_value', type: 'jsonb', nullable: true })
  newValue?: any;

  @Column({ name: 'ip_address', type: 'inet', nullable: true })
  ipAddress?: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt: Date;
}
