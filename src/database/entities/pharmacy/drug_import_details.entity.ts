import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DrugImport } from './drug_imports.entity';
import { RefDrug } from './ref_drugs.entity';

@Entity('drug_import_details')
export class DrugImportDetail {
  @PrimaryGeneratedColumn({ name: 'import_detail_id' })
  importDetailId: number;

  @ManyToOne(() => DrugImport, { nullable: false })
  @JoinColumn({ name: 'import_id', referencedColumnName: 'importId' })
  importId: DrugImport;

  @ManyToOne(() => RefDrug, { nullable: false })
  @JoinColumn({ name: 'drug_id', referencedColumnName: 'drugId' })
  drugId: RefDrug;

  @Column({ name: 'batch_number', length: 50, nullable: true })
  batchNumber?: string;

  @Column({ name: 'expiry_date', type: 'date' })
  expiryDate: Date;

  @Column({ name: 'quantity', type: 'int' })
  quantity: number;

  @Column({
    name: 'unit_price',
    type: 'numeric',
    precision: 10,
    scale: 2,
  })
  unitPrice: string;
}
