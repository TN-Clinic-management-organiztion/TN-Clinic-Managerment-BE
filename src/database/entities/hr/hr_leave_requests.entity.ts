import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { StaffProfile } from '../auth/staff_profiles.entity';

export enum LeaveType { ANNUAL = 'ANNUAL', SICK = 'SICK', EMERGENCY = 'EMERGENCY' }
export enum LeaveRequestStatus { PENDING = 'PENDING', APPROVED = 'APPROVED', REJECTED = 'REJECTED' }

@Entity('hr_leave_requests')
export class HrLeaveRequest {
  @PrimaryGeneratedColumn('uuid', { name: 'request_id' })
  request_id: string;

  // --- RAW FKs ---
  @Column({ name: 'staff_id', type: 'uuid' })
  staff_id: string;

  @Column({ name: 'decision_by', type: 'uuid', nullable: true })
  decision_by?: string | null;

  // --- RELATIONS ---
  @ManyToOne(() => StaffProfile, { nullable: false })
  @JoinColumn({ name: 'staff_id', referencedColumnName: 'staff_id' })
  staff: StaffProfile;

  @ManyToOne(() => StaffProfile, { nullable: true })
  @JoinColumn({ name: 'decision_by', referencedColumnName: 'staff_id' })
  approver?: StaffProfile; // Đổi tên relation thành approver

  // --- COLUMNS ---
  @Column({ name: 'leave_type', type: 'enum', enum: LeaveType })
  leave_type: LeaveType;

  @Column({ name: 'start_date', type: 'date' })
  start_date: Date;

  @Column({ name: 'end_date', type: 'date' })
  end_date: Date;

  @Column({ name: 'total_days', type: 'numeric', precision: 4, scale: 1 })
  total_days: string;

  @Column({ name: 'status', type: 'enum', enum: LeaveRequestStatus, default: LeaveRequestStatus.PENDING })
  status: LeaveRequestStatus;

  @Column({ name: 'decision_at', type: 'timestamptz', nullable: true })
  decision_at?: Date | null;

  @Column({ name: 'reason', type: 'text' })
  reason: string;

  @Column({ name: 'contact_info', length: 100, nullable: true })
  contact_info?: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updated_at: Date;
}