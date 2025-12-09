import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PrescriptionDetail } from './prescription_details.entity';
import { DrugBatch } from './drug_batches.entity';

@Entity('prescription_batch_dispenses')
export class PrescriptionBatchDispense {
  @PrimaryGeneratedColumn('increment', {
    name: 'id',
    type: 'bigint',
  })
  id: string;

  @ManyToOne(() => PrescriptionDetail, { nullable: false })
  @JoinColumn({
    name: 'detail_id',
    referencedColumnName: 'detailId',
  })
  detailId: PrescriptionDetail;

  @ManyToOne(() => DrugBatch, { nullable: false })
  @JoinColumn({
    name: 'batch_id',
    referencedColumnName: 'batchId',
  })
  batchId: DrugBatch;

  @Column({ name: 'quantity', type: 'int' })
  quantity: number;

  @CreateDateColumn({
    name: 'dispensed_at',
    type: 'timestamptz',
  })
  dispensedAt: Date;
}