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
  import_detail_id: number;

  // --- RAW FKs ---
  @Column({ name: 'import_id', type: 'int' })
  import_id: number;

  @Column({ name: 'drug_id', type: 'int' })
  drug_id: number;

  // --- RELATIONS ---
  @ManyToOne(() => DrugImport, { nullable: false })
  @JoinColumn({ name: 'import_id', referencedColumnName: 'import_id' })
  drug_import: DrugImport; // Đổi tên để tránh conflict từ khóa import

  @ManyToOne(() => RefDrug, { nullable: false })
  @JoinColumn({ name: 'drug_id', referencedColumnName: 'drug_id' })
  drug: RefDrug;

  // --- COLUMNS ---
  @Column({ name: 'batch_number', length: 50, nullable: true })
  batch_number?: string;

  @Column({ name: 'expiry_date', type: 'date' })
  expiry_date: Date;

  @Column({ name: 'quantity', type: 'int' })
  quantity: number;

  @Column({ name: 'unit_price', type: 'numeric', precision: 10, scale: 2 })
  unit_price: string;
}
