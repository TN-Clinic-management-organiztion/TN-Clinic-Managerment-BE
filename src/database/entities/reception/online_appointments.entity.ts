import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { PatientProfile } from '../auth/patient_profiles.entity';
import { StaffProfile } from '../auth/staff_profiles.entity';
import { OrgRoom } from '../auth/org_rooms.entity';

export enum AppointmentStatus {
  PENDING = 'PENDING',         // Chờ phòng khám/bác sĩ xác nhận
  CONFIRMED = 'CONFIRMED',     // Đã xác nhận lịch
  RESCHEDULED = 'RESCHEDULED', // Đổi lịch
  CANCELLED = 'CANCELLED',     // Huỷ bởi bệnh nhân hoặc phòng khám
  NO_SHOW = 'NO_SHOW',         // Không đến
  COMPLETED = 'COMPLETED',     // Hoàn thành buổi khám
}

@Entity('online_appointments')
export class OnlineAppointment {
  @PrimaryGeneratedColumn('uuid', { name: 'appointment_id' })
  appointmentId: string;

  @ManyToOne(() => PatientProfile, { nullable: false })
  @JoinColumn({ name: 'patient_id', referencedColumnName: 'patientId' })
  patientId: PatientProfile;

  @Column({ name: 'appointment_date', type: 'date' })
  appointmentDate: Date;

  @Column({ name: 'appointment_time', type: 'time' })
  appointmentTime: string;

  @ManyToOne(() => OrgRoom, { nullable: true })
  @JoinColumn({ name: 'desired_room_id', referencedColumnName: 'roomId' })
  desiredRoomId?: OrgRoom;

  @ManyToOne(() => StaffProfile, { nullable: true })
  @JoinColumn({ name: 'desired_doctor_id', referencedColumnName: 'staffId' })
  desiredDoctorId?: StaffProfile;

  @Column({ name: 'symptoms', type: 'text', nullable: true })
  symptoms?: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.CONFIRMED,
  })
  status: AppointmentStatus;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamptz',
    nullable: true,
  })
  deletedAt?: Date;
}
