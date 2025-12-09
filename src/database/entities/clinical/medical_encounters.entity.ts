import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
} from 'typeorm';
import { PatientProfile } from '../auth/patient_profiles.entity';
import { StaffProfile } from '../auth/staff_profiles.entity';
import { OrgRoom } from '../auth/org_rooms.entity';
import { RefIcd10 } from './ref_icd10.entity';

export enum EncounterStatus {
  REGISTERED = 'REGISTERED',
  AWAITING_PAYMENT = 'AWAITING_PAYMENT',
  IN_CONSULTATION = 'IN_CONSULTATION',
  AWAITING_CLS = 'AWAITING_CLS',
  IN_CLS = 'IN_CLS',
  CLS_COMPLETED = 'CLS_COMPLETED',
  RESULTS_READY = 'RESULTS_READY',
  COMPLETED = 'COMPLETED',
}

@Entity('medical_encounters')
export class MedicalEncounter {
  @PrimaryGeneratedColumn('uuid', { name: 'encounter_id' })
  encounterId: string;

  @ManyToOne(() => PatientProfile, { nullable: true })
  @JoinColumn({ name: 'patient_id', referencedColumnName: 'patientId' })
  patientId?: PatientProfile;

  @ManyToOne(() => StaffProfile, { nullable: true })
  @JoinColumn({ name: 'doctor_id', referencedColumnName: 'staffId' })
  doctorId?: StaffProfile;

  @ManyToOne(() => OrgRoom, { nullable: true })
  @JoinColumn({ name: 'assigned_room_id', referencedColumnName: 'roomId' })
  assignedRoomId?: OrgRoom;

  @Column({
    name: 'visit_date',
    type: 'timestamptz',
    default: () => 'NOW()',
  })
  visitDate: Date;

  @Column({
    name: 'current_status',
    type: 'enum',
    enum: EncounterStatus,
    default: EncounterStatus.REGISTERED,
  })
  currentStatus: EncounterStatus;

  @Column({ name: 'initial_symptoms', type: 'text', nullable: true })
  initialSymptoms?: string;

  @ManyToOne(() => RefIcd10, { nullable: true })
  @JoinColumn({ name: 'final_icd_code', referencedColumnName: 'icdCode' })
  finalIcdCode?: RefIcd10;

  @Column({ name: 'doctor_conclusion', type: 'text', nullable: true })
  doctorConclusion?: string;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamptz',
    nullable: true,
  })
  deletedAt?: Date;
}
