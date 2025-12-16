import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { StaffProfile } from '../auth/staff_profiles.entity';
import { HrShift } from './hr_shifts.entity';
import { HrLeaveRequest } from './hr_leave_requests.entity';

export enum AttendanceStatus { PRESENT = 'PRESENT', ABSENT = 'ABSENT', LEAVE = 'LEAVE', HOLIDAY = 'HOLIDAY' }

@Entity('hr_time_attendance')
@Unique('uk_staff_work_date', ['staff_id', 'work_date'])
export class HrTimeAttendance {
  @PrimaryGeneratedColumn('uuid', { name: 'attendance_id' })
  attendance_id: string;

  // --- RAW FKs ---
  @Column({ name: 'staff_id', type: 'uuid' })
  staff_id: string;

  @Column({ name: 'shift_id', type: 'int', nullable: true })
  shift_id?: number | null;

  @Column({ name: 'leave_request_id', type: 'uuid', nullable: true })
  leave_request_id?: string | null;

  // --- RELATIONS ---
  @ManyToOne(() => StaffProfile, { nullable: false })
  @JoinColumn({ name: 'staff_id', referencedColumnName: 'staff_id' })
  staff: StaffProfile;

  @ManyToOne(() => HrShift, { nullable: true })
  @JoinColumn({ name: 'shift_id', referencedColumnName: 'shift_id' })
  shift?: HrShift;

  @ManyToOne(() => HrLeaveRequest, { nullable: true })
  @JoinColumn({ name: 'leave_request_id', referencedColumnName: 'request_id' })
  leave_request?: HrLeaveRequest;

  // --- COLUMNS ---
  @Column({ name: 'work_date', type: 'date', default: () => 'CURRENT_DATE' })
  work_date: Date;

  @Column({ name: 'check_in_time', type: 'timestamptz', nullable: true })
  check_in_time?: Date;

  @Column({ name: 'check_in_ip', type: 'inet', nullable: true })
  check_in_ip?: string ;

  @Column({ name: 'check_out_time', type: 'timestamptz', nullable: true })
  check_out_time?: Date ;

  @Column({ name: 'check_out_ip', type: 'inet', nullable: true })
  check_out_ip?: string ;

  @Column({ name: 'actual_hours', type: 'numeric', precision: 4, scale: 2, nullable: true })
  actual_hours?: string ;

  @Column({ name: 'is_late', default: false })
  is_late: boolean;

  @Column({ name: 'late_minutes', type: 'int', default: 0 })
  late_minutes: number;

  @Column({ name: 'is_early_leave', default: false })
  is_early_leave: boolean;

  @Column({ name: 'early_leave_minutes', type: 'int', default: 0 })
  early_leave_minutes: number;

  @Column({ name: 'overtime_minutes', type: 'int', default: 0 })
  overtime_minutes: number;

  @Column({ name: 'status', type: 'enum', enum: AttendanceStatus, default: AttendanceStatus.PRESENT })
  status: AttendanceStatus;

  @Column({ name: 'admin_notes', type: 'text', nullable: true })
  admin_notes?: string ;
}