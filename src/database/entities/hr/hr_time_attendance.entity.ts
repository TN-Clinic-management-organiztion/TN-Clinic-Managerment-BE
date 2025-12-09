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
import { HrShift } from './hr_shifts.entity';
import { HrLeaveRequest } from './hr_leave_requests.entity';

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LEAVE = 'LEAVE',
  HOLIDAY = 'HOLIDAY',
}

@Entity('hr_time_attendance')
@Unique('uk_staff_work_date', ['staffId', 'workDate'])
export class HrTimeAttendance {
  @PrimaryGeneratedColumn('uuid', { name: 'attendance_id' })
  attendanceId: string;

  @ManyToOne(() => StaffProfile, { nullable: false })
  @JoinColumn({ name: 'staff_id', referencedColumnName: 'staffId' })
  staffId: StaffProfile;

  @ManyToOne(() => HrShift, { nullable: true })
  @JoinColumn({ name: 'shift_id', referencedColumnName: 'shiftId' })
  shiftId?: HrShift;

  @Column({
    name: 'work_date',
    type: 'date',
    default: () => 'CURRENT_DATE',
  })
  workDate: Date;

  // Check-in
  @Column({
    name: 'check_in_time',
    type: 'timestamptz',
    nullable: true,
  })
  checkInTime?: Date;

  @Column({ name: 'check_in_ip', type: 'inet', nullable: true })
  checkInIp?: string;

  // Check-out
  @Column({
    name: 'check_out_time',
    type: 'timestamptz',
    nullable: true,
  })
  checkOutTime?: Date;

  @Column({ name: 'check_out_ip', type: 'inet', nullable: true })
  checkOutIp?: string;

  // Calculated fields
  @Column({
    name: 'actual_hours',
    type: 'numeric',
    precision: 4,
    scale: 2,
    nullable: true,
  })
  actualHours?: string;

  @Column({ name: 'is_late', default: false })
  isLate: boolean;

  @Column({ name: 'late_minutes', type: 'int', default: 0 })
  lateMinutes: number;

  @Column({ name: 'is_early_leave', default: false })
  isEarlyLeave: boolean;

  @Column({ name: 'early_leave_minutes', type: 'int', default: 0 })
  earlyLeaveMinutes: number;

  @Column({ name: 'overtime_minutes', type: 'int', default: 0 })
  overtimeMinutes: number;

  @Column({
    name: 'status',
    type: 'enum',
    enum: AttendanceStatus,
    default: AttendanceStatus.PRESENT,
  })
  status: AttendanceStatus;

  @ManyToOne(() => HrLeaveRequest, { nullable: true })
  @JoinColumn({
    name: 'leave_request_id',
    referencedColumnName: 'requestId',
  })
  leaveRequestId?: HrLeaveRequest;

  @Column({ name: 'admin_notes', type: 'text', nullable: true })
  adminNotes?: string;
}
