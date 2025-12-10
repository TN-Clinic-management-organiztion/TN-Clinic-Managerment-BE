import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { MedicalEncounter } from '../clinical/medical_encounters.entity';
import { StaffProfile } from '../auth/staff_profiles.entity';

export enum InvoiceStatus { DRAFT = 'DRAFT', UNPAID = 'UNPAID', PARTIAL = 'PARTIAL', PAID = 'PAID', CANCELLED = 'CANCELLED' }

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid', { name: 'invoice_id' })
  invoice_id: string;

  // --- RAW FKs ---
  @Column({ name: 'encounter_id', type: 'uuid', nullable: true })
  encounter_id?: string | null;

  @Column({ name: 'cashier_id', type: 'uuid', nullable: true })
  cashier_id?: string | null;

  // --- RELATIONS ---
  @ManyToOne(() => MedicalEncounter, { nullable: true })
  @JoinColumn({ name: 'encounter_id', referencedColumnName: 'encounter_id' })
  encounter?: MedicalEncounter;

  @ManyToOne(() => StaffProfile, { nullable: true })
  @JoinColumn({ name: 'cashier_id', referencedColumnName: 'staff_id' })
  cashier?: StaffProfile;

  // --- COLUMNS ---
  @Column({ name: 'total_amount', type: 'numeric', precision: 15, scale: 2, nullable: true })
  total_amount?: string | null;

  @Column({ name: 'status', type: 'enum', enum: InvoiceStatus, default: InvoiceStatus.UNPAID })
  status: InvoiceStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date;

  @Column({ name: 'payment_time', type: 'timestamptz', nullable: true })
  payment_time?: Date | null;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deleted_at?: Date | null;
}