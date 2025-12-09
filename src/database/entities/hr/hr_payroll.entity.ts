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
@Unique('uk_staff_payroll_month', ['staffId', 'payrollMonth'])
export class HrPayroll {
  @PrimaryGeneratedColumn('uuid', { name: 'payroll_id' })
  payrollId: string;

  @ManyToOne(() => StaffProfile, { nullable: false })
  @JoinColumn({ name: 'staff_id', referencedColumnName: 'staffId' })
  staffId: StaffProfile;

  @Column({ name: 'payroll_month', type: 'date' })
  payrollMonth: Date;

  @Column({
    name: 'work_days',
    type: 'numeric',
    precision: 4,
    scale: 2,
    default: 0,
  })
  workDays: string;

  @Column({
    name: 'leave_days',
    type: 'numeric',
    precision: 4,
    scale: 2,
    default: 0,
  })
  leaveDays: string;

  @Column({
    name: 'total_paid_days',
    type: 'numeric',
    precision: 4,
    scale: 2,
  })
  totalPaidDays: string;

  @Column({
    name: 'overtime_hours',
    type: 'numeric',
    precision: 5,
    scale: 2,
    default: 0,
  })
  overtimeHours: string;

  @Column({
    name: 'base_salary',
    type: 'numeric',
    precision: 10,
    scale: 2,
  })
  baseSalary: string;

  @Column({
    name: 'actual_salary',
    type: 'numeric',
    precision: 10,
    scale: 2,
  })
  actualSalary: string;

  @Column({
    name: 'overtime_salary',
    type: 'numeric',
    precision: 10,
    scale: 2,
    default: 0,
  })
  overtimeSalary: string;

  @Column({
    name: 'total_allowances',
    type: 'numeric',
    precision: 10,
    scale: 2,
    default: 0,
  })
  totalAllowances: string;

  @Column({
    name: 'total_bonus',
    type: 'numeric',
    precision: 10,
    scale: 2,
    default: 0,
  })
  totalBonus: string;

  @Column({
    name: 'total_penalty',
    type: 'numeric',
    precision: 10,
    scale: 2,
    default: 0,
  })
  totalPenalty: string;

  @Column({
    name: 'net_salary',
    type: 'numeric',
    precision: 10,
    scale: 2,
  })
  netSalary: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: PayrollStatus,
    default: PayrollStatus.DRAFT,
  })
  status: PayrollStatus;

  @ManyToOne(() => StaffProfile, { nullable: true })
  @JoinColumn({ name: 'approved_by', referencedColumnName: 'staffId' })
  approvedBy?: StaffProfile;

  @Column({
    name: 'paid_at',
    type: 'timestamptz',
    nullable: true,
  })
  paidAt?: Date;

  @CreateDateColumn({
    name: 'calculated_at',
    type: 'timestamptz',
  })
  calculatedAt: Date;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes?: string;
}
