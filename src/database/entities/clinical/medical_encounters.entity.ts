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

// Helper để chuyển đổi Numeric (Postgres) sang Number (JS)
const numericTransformer = {
  to: (value: number | null) => value,
  from: (value: string | null) => (value === null ? null : parseFloat(value)),
};

@Entity('medical_encounters')
export class MedicalEncounter {
  @PrimaryGeneratedColumn('uuid', { name: 'encounter_id' })
  encounter_id: string;

  // --- RAW FKs ---
  @Column({ name: 'patient_id', type: 'uuid', nullable: true })
  patient_id?: string | null;

  @Column({ name: 'doctor_id', type: 'uuid', nullable: true })
  doctor_id?: string | null;

  @Column({ name: 'assigned_room_id', type: 'int', nullable: true })
  assigned_room_id?: number | null;

  @Column({ name: 'final_icd_code', length: 10, nullable: true })
  final_icd_code?: string | null;

  // --- RELATIONS ---
  @ManyToOne(() => PatientProfile, { nullable: true })
  @JoinColumn({ name: 'patient_id', referencedColumnName: 'patient_id' })
  patient?: PatientProfile;

  @ManyToOne(() => StaffProfile, { nullable: true })
  @JoinColumn({ name: 'doctor_id', referencedColumnName: 'staff_id' })
  doctor?: StaffProfile;

  @ManyToOne(() => OrgRoom, { nullable: true })
  @JoinColumn({ name: 'assigned_room_id', referencedColumnName: 'room_id' })
  assigned_room?: OrgRoom;

  @ManyToOne(() => RefIcd10, { nullable: true })
  @JoinColumn({ name: 'final_icd_code', referencedColumnName: 'icd_code' })
  icd_ref?: RefIcd10;

  // --- COLUMNS ---
  @Column({ name: 'visit_date', type: 'timestamptz', default: () => 'NOW()' })
  visit_date: Date;

  @Column({
    name: 'current_status',
    type: 'enum',
    enum: EncounterStatus,
    default: EncounterStatus.REGISTERED,
  })
  current_status: EncounterStatus;

  @Column({ name: 'initial_symptoms', type: 'text', nullable: true })
  initial_symptoms?: string;

  // --- VITAL SIGNS (CHỈ SỐ SINH HIỆU) ---
  @Column({
    name: 'weight',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    transformer: numericTransformer,
  })
  weight?: number; // Cân nặng (kg)

  @Column({
    name: 'height',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    transformer: numericTransformer,
  })
  height?: number; // Chiều cao (cm)

  @Column({
    name: 'bmi',
    type: 'numeric',
    precision: 4,
    scale: 2,
    nullable: true,
    transformer: numericTransformer,
  })
  bmi?: number; // BMI

  @Column({
    name: 'temperature',
    type: 'numeric',
    precision: 4,
    scale: 1,
    nullable: true,
    transformer: numericTransformer,
  })
  temperature?: number; // Nhiệt độ (°C)

  @Column({ name: 'pulse', type: 'int', nullable: true })
  pulse?: number; // Mạch (lần/phút)

  @Column({ name: 'respiratory_rate', type: 'int', nullable: true })
  respiratory_rate?: number; // Nhịp thở (lần/phút)

  @Column({ name: 'bp_systolic', type: 'int', nullable: true })
  bp_systolic?: number; // Huyết áp tâm thu (số trên)

  @Column({ name: 'bp_diastolic', type: 'int', nullable: true })
  bp_diastolic?: number; // Huyết áp tâm trương (số dưới)

  @Column({
    name: 'sp_o2',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    transformer: numericTransformer,
  })
  sp_o2?: number; // SpO2 (%)

  // --- CONCLUSIONS ---
  @Column({ name: 'doctor_conclusion', type: 'text', nullable: true })
  doctor_conclusion?: string;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deleted_at?: Date;
}