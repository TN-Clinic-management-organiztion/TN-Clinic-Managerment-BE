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
  detailId: string;

  @ManyToOne(() => Prescription, { nullable: true })
  @JoinColumn({
    name: 'prescription_id',
    referencedColumnName: 'prescriptionId',
  })
  prescriptionId?: Prescription;

  @ManyToOne(() => RefDrug, { nullable: true })
  @JoinColumn({ name: 'drug_id', referencedColumnName: 'drugId' })
  drugId?: RefDrug;

  @Column({ name: 'quantity', type: 'int' })
  quantity: number;

  @Column({ name: 'usage_note', type: 'text', nullable: true })
  usageNote?: string;
}
