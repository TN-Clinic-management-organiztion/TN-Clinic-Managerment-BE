import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DrugSupplier } from './drug_suppliers.entity';
import { StaffProfile } from '../auth/staff_profiles.entity';

@Entity('drug_imports')
export class DrugImport {
  @PrimaryGeneratedColumn({ name: 'import_id' })
  importId: number;

  @Column({
    name: 'import_date',
    type: 'date',
    default: () => 'CURRENT_DATE',
  })
  importDate: Date;

  @ManyToOne(() => DrugSupplier, { nullable: true })
  @JoinColumn({ name: 'supplier_id', referencedColumnName: 'supplierId' })
  supplierId?: DrugSupplier;

  @Column({
    name: 'total_amount',
    type: 'numeric',
    precision: 15,
    scale: 2,
    nullable: true,
  })
  totalAmount?: string;

  @Column({ name: 'invoice_number', length: 100, nullable: true })
  invoiceNumber?: string;

  @ManyToOne(() => StaffProfile, { nullable: true })
  @JoinColumn({
    name: 'imported_by',
    referencedColumnName: 'staffId',
  })
  importedBy?: StaffProfile;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt: Date;
}
