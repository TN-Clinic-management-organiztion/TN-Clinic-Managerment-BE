import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { StaffProfile } from '../auth/staff_profiles.entity';

export enum PayrollStatus {
  DRAFT = 'DRAFT',
  CALCULATED = 'CALCULATED',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
}

@Entity('hr_payroll')
// Lưu ý: Update tên thuộc tính trong Unique constraint
@Unique('uk_staff_payroll_month', ['staff_id', 'payroll_month'])
export class HrPayroll {
  @PrimaryGeneratedColumn('uuid', { name: 'payroll_id' })
  payroll_id: string;

  @ManyToOne(() => StaffProfile, { nullable: false })
  @JoinColumn({ name: 'staff_id', referencedColumnName: 'staff_id' })
  staff_id: StaffProfile;

  @Column({ name: 'payroll_month', type: 'date' })
  payroll_month: Date;

  @Column({
    name: 'work_days',
    type: 'numeric',
    precision: 4,
    scale: 2,
    default: 0,
  })
  work_days: string;

  @Column({
    name: 'leave_days',
    type: 'numeric',
    precision: 4,
    scale: 2,
    default: 0,
  })
  leave_days: string;

  @Column({
    name: 'total_paid_days',
    type: 'numeric',
    precision: 4,
    scale: 2,
  })
  total_paid_days: string;

  @Column({
    name: 'overtime_hours',
    type: 'numeric',
    precision: 5,
    scale: 2,
    default: 0,
  })
  overtime_hours: string;

  @Column({
    name: 'base_salary',
    type: 'numeric',
    precision: 10,
    scale: 2,
  })
  base_salary: string;

  @Column({
    name: 'actual_salary',
    type: 'numeric',
    precision: 10,
    scale: 2,
  })
  actual_salary: string;

  @Column({
    name: 'overtime_salary',
    type: 'numeric',
    precision: 10,
    scale: 2,
    default: 0,
  })
  overtime_salary: string;

  @Column({
    name: 'total_allowances',
    type: 'numeric',
    precision: 10,
    scale: 2,
    default: 0,
  })
  total_allowances: string;

  @Column({
    name: 'total_bonus',
    type: 'numeric',
    precision: 10,
    scale: 2,
    default: 0,
  })
  total_bonus: string;

  @Column({
    name: 'total_penalty',
    type: 'numeric',
    precision: 10,
    scale: 2,
    default: 0,
  })
  total_penalty: string;

  @Column({
    name: 'net_salary',
    type: 'numeric',
    precision: 10,
    scale: 2,
  })
  net_salary: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: PayrollStatus,
    default: PayrollStatus.DRAFT,
  })
  status: PayrollStatus;

  @ManyToOne(() => StaffProfile, { nullable: true })
  @JoinColumn({ name: 'approved_by', referencedColumnName: 'staff_id' })
  approved_by?: StaffProfile;

  @Column({
    name: 'paid_at',
    type: 'timestamptz',
    nullable: true,
  })
  paid_at?: Date;

  @CreateDateColumn({
    name: 'calculated_at',
    type: 'timestamptz',
  })
  calculated_at: Date;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes?: string;

  @ManyToOne(() => StaffProfile, { nullable: false })
  @JoinColumn({ name: 'staff_id', referencedColumnName: 'staff_id' })
  staff: StaffProfile;

  @ManyToOne(() => StaffProfile, { nullable: true })
  @JoinColumn({ name: 'approved_by', referencedColumnName: 'staff_id' })
  approver?: StaffProfile;
}
