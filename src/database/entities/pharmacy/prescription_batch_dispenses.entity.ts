import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PrescriptionDetail } from './prescription_details.entity';
import { DrugBatch } from './drug_batches.entity';

@Entity('prescription_batch_dispenses')
export class PrescriptionBatchDispense {
  @PrimaryGeneratedColumn('increment', { name: 'id', type: 'bigint' })
  id: string;

  // --- RAW FKs ---
  @Column({ name: 'detail_id', type: 'uuid' })
  detail_id: string;

  @Column({ name: 'batch_id', type: 'int' })
  batch_id: number;

  // --- RELATIONS ---
  @ManyToOne(() => PrescriptionDetail, { nullable: false })
  @JoinColumn({ name: 'detail_id', referencedColumnName: 'detail_id' })
  prescription_detail: PrescriptionDetail;

  @ManyToOne(() => DrugBatch, { nullable: false })
  @JoinColumn({ name: 'batch_id', referencedColumnName: 'batch_id' })
  drug_batch: DrugBatch;

  // --- COLUMNS ---
  @Column({ name: 'quantity', type: 'int' })
  quantity: number;

  @CreateDateColumn({ name: 'dispensed_at', type: 'timestamptz' })
  dispensed_at: Date;
}