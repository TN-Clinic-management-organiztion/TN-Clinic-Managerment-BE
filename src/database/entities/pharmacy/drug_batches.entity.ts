import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DrugImportDetail } from './drug_import_details.entity';
import { RefDrug } from './ref_drugs.entity';
import { InventoryLocation } from './inventory_locations.entity';

@Entity('drug_batches')
export class DrugBatch {
  @PrimaryGeneratedColumn({ name: 'batch_id' })
  batchId: number;

  @ManyToOne(() => DrugImportDetail, { nullable: false })
  @JoinColumn({
    name: 'import_detail_id',
    referencedColumnName: 'importDetailId',
  })
  importDetailId: DrugImportDetail;

  @ManyToOne(() => RefDrug, { nullable: false })
  @JoinColumn({ name: 'drug_id', referencedColumnName: 'drugId' })
  drugId: RefDrug;

  @Column({ name: 'batch_number', length: 50, nullable: true })
  batchNumber?: string;

  @Column({ name: 'expiry_date', type: 'date' })
  expiryDate: Date;

  @Column({ name: 'quantity_initial', type: 'int' })
  quantityInitial: number;

  @Column({ name: 'quantity_current', type: 'int' })
  quantityCurrent: number;

  @ManyToOne(() => InventoryLocation, { nullable: true })
  @JoinColumn({
    name: 'location_id',
    referencedColumnName: 'locationId',
  })
  locationId?: InventoryLocation;

  @Column({ name: 'is_opened_box', default: false })
  isOpenedBox: boolean;
}
