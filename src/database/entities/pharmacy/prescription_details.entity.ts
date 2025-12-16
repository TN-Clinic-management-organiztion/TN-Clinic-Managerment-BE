import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Prescription } from './prescriptions.entity';
import { RefDrug } from './ref_drugs.entity';

@Entity('prescription_details')
export class PrescriptionDetail {
  @PrimaryGeneratedColumn('uuid', { name: 'detail_id' })
  detail_id: string;

  // --- RAW FKs ---
  @Column({ name: 'prescription_id', type: 'uuid', nullable: true })
  prescription_id?: string | null;

  @Column({ name: 'drug_id', type: 'int', nullable: true })
  drug_id?: number | null;

  // --- RELATIONS ---
  @ManyToOne(() => Prescription, { nullable: true })
  @JoinColumn({
    name: 'prescription_id',
    referencedColumnName: 'prescription_id',
  })
  prescription?: Prescription;

  @ManyToOne(() => RefDrug, { nullable: true })
  @JoinColumn({ name: 'drug_id', referencedColumnName: 'drug_id' })
  drug?: RefDrug;

  // --- COLUMNS ---
  @Column({ name: 'quantity', type: 'int' })
  quantity: number;

  @Column({ name: 'usage_note', type: 'text', nullable: true })
  usage_note?: string;
}
