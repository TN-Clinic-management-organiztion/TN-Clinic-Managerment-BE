import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StaffProfile } from '../auth/staff_profiles.entity';

export enum LeaveType {
  ANNUAL = 'ANNUAL',
  SICK = 'SICK',
  EMERGENCY = 'EMERGENCY',
}

export enum LeaveRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('hr_leave_requests')
export class HrLeaveRequest {
  @PrimaryGeneratedColumn('uuid', { name: 'request_id' })
  requestId: string;

  @ManyToOne(() => StaffProfile, { nullable: false })
  @JoinColumn({ name: 'staff_id', referencedColumnName: 'staffId' })
  staffId: StaffProfile;

  @Column({
    name: 'leave_type',
    type: 'enum',
    enum: LeaveType,
  })
  leaveType: LeaveType;

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date' })
  endDate: Date;

  @Column({
    name: 'total_days',
    type: 'numeric',
    precision: 4,
    scale: 1,
  })
  totalDays: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: LeaveRequestStatus,
    default: LeaveRequestStatus.PENDING,
  })
  status: LeaveRequestStatus;

  @ManyToOne(() => StaffProfile, { nullable: true })
  @JoinColumn({ name: 'decision_by', referencedColumnName: 'staffId' })
  decisionBy?: StaffProfile;

  @Column({
    name: 'decision_at',
    type: 'timestamptz',
    nullable: true,
  })
  decisionAt?: Date;

  @Column({ name: 'reason', type: 'text' })
  reason: string;

  @Column({ name: 'contact_info', length: 100, nullable: true })
  contactInfo?: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt: Date;
}
