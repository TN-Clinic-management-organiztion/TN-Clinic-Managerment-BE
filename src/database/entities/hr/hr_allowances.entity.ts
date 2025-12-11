import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { StaffProfile } from '../auth/staff_profiles.entity';
import { SysRole } from '../auth/sys_roles.entity';

export enum AllowanceTargetType {
  INDIVIDUAL = 'INDIVIDUAL',
  GROUP = 'GROUP',
}

@Entity('hr_allowances')
export class HrAllowance {
  @PrimaryGeneratedColumn({ name: 'allowance_id' })
  allowance_id: number;

  // --- RAW FKs ---
  @Column({ name: 'staff_id', type: 'uuid', nullable: true })
  staff_id?: string | null;

  @Column({ name: 'role_id', type: 'int', nullable: true })
  role_id?: number | null;

  @Column({ name: 'created_by', type: 'uuid' })
  created_by: string;

  // --- RELATIONS ---
  @ManyToOne(() => StaffProfile, { nullable: true })
  @JoinColumn({ name: 'staff_id', referencedColumnName: 'staff_id' })
  staff?: StaffProfile;

  @ManyToOne(() => SysRole, { nullable: true })
  @JoinColumn({ name: 'role_id', referencedColumnName: 'role_id' })
  role?: SysRole;

  @ManyToOne(() => StaffProfile, { nullable: false })
  @JoinColumn({ name: 'created_by', referencedColumnName: 'staff_id' })
  creator: StaffProfile; // Đổi tên relation thành creator

  // --- COLUMNS ---
  @Column({ name: 'allowance_type', length: 50 })
  allowance_type: string;

  @Column({ name: 'amount', type: 'numeric', precision: 10, scale: 2 })
  amount: string;

  @Column({ name: 'target_type', type: 'enum', enum: AllowanceTargetType })
  target_type: AllowanceTargetType;

  @Column({ name: 'start_date', type: 'date' })
  start_date: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  end_date?: Date;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date;
}
