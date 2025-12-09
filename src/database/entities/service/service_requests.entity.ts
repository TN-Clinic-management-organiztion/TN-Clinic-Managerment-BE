import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MedicalEncounter } from '../clinical/medical_encounters.entity';
import { StaffProfile } from '../auth/staff_profiles.entity';

export enum ServiceRequestPaymentStatus {
  UNPAID = 'UNPAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

@Entity('service_requests')
export class ServiceRequest {
  @PrimaryGeneratedColumn('uuid', { name: 'request_id' })
  requestId: string;

  @ManyToOne(() => MedicalEncounter, { nullable: true })
  @JoinColumn({ name: 'encounter_id', referencedColumnName: 'encounterId' })
  encounterId?: MedicalEncounter;

  @ManyToOne(() => StaffProfile, { nullable: true })
  @JoinColumn({
    name: 'requesting_doctor_id',
    referencedColumnName: 'staffId',
  })
  requestingDoctorId?: StaffProfile;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt: Date;

  @Column({
    name: 'payment_status',
    type: 'enum',
    enum: ServiceRequestPaymentStatus,
    default: ServiceRequestPaymentStatus.UNPAID,
  })
  paymentStatus: ServiceRequestPaymentStatus;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes?: string;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamptz',
    nullable: true,
  })
  deletedAt?: Date;
}
