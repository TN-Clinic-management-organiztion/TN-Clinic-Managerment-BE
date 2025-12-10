import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn, DeleteDateColumn } from 'typeorm';
import { PatientProfile } from '../auth/patient_profiles.entity';
import { StaffProfile } from '../auth/staff_profiles.entity';
import { OrgRoom } from '../auth/org_rooms.entity';

export enum AppointmentStatus {
  PENDING = 'PENDING', CONFIRMED = 'CONFIRMED', RESCHEDULED = 'RESCHEDULED',
  CANCELLED = 'CANCELLED', NO_SHOW = 'NO_SHOW', COMPLETED = 'COMPLETED'
}

@Entity('online_appointments')
export class OnlineAppointment {
  @PrimaryGeneratedColumn('uuid', { name: 'appointment_id' })
  appointment_id: string;

  // --- RAW FKs ---
  @Column({ name: 'patient_id', type: 'uuid' })
  patient_id: string;

  @Column({ name: 'desired_room_id', type: 'int', nullable: true })
  desired_room_id?: number | null;

  @Column({ name: 'desired_doctor_id', type: 'uuid', nullable: true })
  desired_doctor_id?: string | null;

  // --- RELATIONS ---
  @ManyToOne(() => PatientProfile, { nullable: false })
  @JoinColumn({ name: 'patient_id', referencedColumnName: 'patient_id' })
  patient: PatientProfile;

  @ManyToOne(() => OrgRoom, { nullable: true })
  @JoinColumn({ name: 'desired_room_id', referencedColumnName: 'room_id' })
  desired_room?: OrgRoom;

  @ManyToOne(() => StaffProfile, { nullable: true })
  @JoinColumn({ name: 'desired_doctor_id', referencedColumnName: 'staff_id' })
  desired_doctor?: StaffProfile;

  // --- COLUMNS ---
  @Column({ name: 'appointment_date', type: 'date' })
  appointment_date: Date;

  @Column({ name: 'appointment_time', type: 'time' })
  appointment_time: string;

  @Column({ name: 'symptoms', type: 'text', nullable: true })
  symptoms?: string | null;

  @Column({ name: 'status', type: 'enum', enum: AppointmentStatus, default: AppointmentStatus.CONFIRMED })
  status: AppointmentStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deleted_at?: Date | null;
}