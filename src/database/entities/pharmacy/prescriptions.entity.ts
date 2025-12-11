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
  DRAFT = 'DRAFT',
  ISSUED = 'ISSUED',
  DISPENSED = 'DISPENSED',
  CANCELLED = 'CANCELLED',
}

@Entity('prescriptions')
export class Prescription {
  @PrimaryGeneratedColumn('uuid', { name: 'prescription_id' })
  prescription_id: string;

  // --- RAW FKs ---
  @Column({ name: 'encounter_id', type: 'uuid', nullable: true })
  encounter_id?: string | null;

  @Column({ name: 'prescribing_doctor_id', type: 'uuid', nullable: true })
  prescribing_doctor_id?: string | null;

  @Column({ name: 'dispensing_pharmacist_id', type: 'uuid', nullable: true })
  dispensing_pharmacist_id?: string | null;

  // --- RELATIONS ---
  @ManyToOne(() => MedicalEncounter, { nullable: true })
  @JoinColumn({ name: 'encounter_id', referencedColumnName: 'encounter_id' })
  encounter?: MedicalEncounter;

  @ManyToOne(() => StaffProfile, { nullable: true })
  @JoinColumn({
    name: 'prescribing_doctor_id',
    referencedColumnName: 'staff_id',
  })
  prescribing_doctor?: StaffProfile;

  @ManyToOne(() => StaffProfile, { nullable: true })
  @JoinColumn({
    name: 'dispensing_pharmacist_id',
    referencedColumnName: 'staff_id',
  })
  dispensing_pharmacist?: StaffProfile;

  // --- COLUMNS ---
  @Column({ name: 'interaction_override_reason', type: 'text', nullable: true })
  interaction_override_reason?: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: PrescriptionStatus,
    default: PrescriptionStatus.DRAFT,
  })
  status: PrescriptionStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deleted_at?: Date;
}
