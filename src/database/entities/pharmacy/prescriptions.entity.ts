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

export enum PrescriptionStatus {
  DRAFT = 'DRAFT', // Nháp
  ISSUED = 'ISSUED', // Phát hành
  DISPENSED = 'DISPENSED', //Bàn giao
  CANCELLED = 'CANCELLED', // Huỷ
}

@Entity('prescriptions')
export class Prescription {
  @PrimaryGeneratedColumn('uuid', { name: 'prescription_id' })
  prescriptionId: string;

  @ManyToOne(() => MedicalEncounter, { nullable: true })
  @JoinColumn({
    name: 'encounter_id',
    referencedColumnName: 'encounterId',
  })
  encounterId?: MedicalEncounter;

  @ManyToOne(() => StaffProfile, { nullable: true })
  @JoinColumn({
    name: 'prescribing_doctor_id',
    referencedColumnName: 'staffId',
  })
  prescribingDoctorId?: StaffProfile;

  @ManyToOne(() => StaffProfile, { nullable: true })
  @JoinColumn({
    name: 'dispensing_pharmacist_id',
    referencedColumnName: 'staffId',
  })
  dispensingPharmacistId?: StaffProfile;

  @Column({
    name: 'interaction_override_reason',
    type: 'text',
    nullable: true,
  })
  interactionOverrideReason?: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: PrescriptionStatus,
    default: PrescriptionStatus.DRAFT,
  })
  status: PrescriptionStatus;

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
