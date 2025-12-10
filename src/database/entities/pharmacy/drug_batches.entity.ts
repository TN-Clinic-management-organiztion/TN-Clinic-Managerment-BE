import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { DrugImportDetail } from './drug_import_details.entity';
import { RefDrug } from './ref_drugs.entity';
import { InventoryLocation } from './inventory_locations.entity';

@Entity('drug_batches')
export class DrugBatch {
  @PrimaryGeneratedColumn({ name: 'batch_id' })
  batch_id: number;

  // --- RAW FKs ---
  @Column({ name: 'import_detail_id', type: 'int' })
  import_detail_id: number;

  @Column({ name: 'drug_id', type: 'int' })
  drug_id: number;

  @Column({ name: 'location_id', type: 'int', nullable: true })
  location_id?: number | null;

  // --- RELATIONS ---
  @ManyToOne(() => DrugImportDetail, { nullable: false })
  @JoinColumn({ name: 'import_detail_id', referencedColumnName: 'import_detail_id' })
  import_detail: DrugImportDetail;

  @ManyToOne(() => RefDrug, { nullable: false })
  @JoinColumn({ name: 'drug_id', referencedColumnName: 'drug_id' })
  drug: RefDrug;

  @ManyToOne(() => InventoryLocation, { nullable: true })
  @JoinColumn({ name: 'location_id', referencedColumnName: 'location_id' })
  location?: InventoryLocation;

  // --- COLUMNS ---
  @Column({ name: 'batch_number', length: 50, nullable: true })
  batch_number?: string | null;

  @Column({ name: 'expiry_date', type: 'date' })
  expiry_date: Date;

  @Column({ name: 'quantity_initial', type: 'int' })
  quantity_initial: number;

  @Column({ name: 'quantity_current', type: 'int' })
  quantity_current: number;

  @Column({ name: 'is_opened_box', default: false })
  is_opened_box: boolean;
}