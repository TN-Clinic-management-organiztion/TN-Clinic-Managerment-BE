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
  import_id: number;

  // --- RAW FKs ---
  @Column({ name: 'supplier_id', type: 'int', nullable: true })
  supplier_id?: number | null;

  @Column({ name: 'imported_by', type: 'uuid', nullable: true })
  imported_by?: string | null;

  // --- RELATIONS ---
  @ManyToOne(() => DrugSupplier, { nullable: true })
  @JoinColumn({ name: 'supplier_id', referencedColumnName: 'supplier_id' })
  supplier?: DrugSupplier;

  @ManyToOne(() => StaffProfile, { nullable: true })
  @JoinColumn({ name: 'imported_by', referencedColumnName: 'staff_id' })
  importer?: StaffProfile; // Đổi tên relation cho rõ nghĩa

  // --- COLUMNS ---
  @Column({ name: 'import_date', type: 'date', default: () => 'CURRENT_DATE' })
  import_date: Date;

  @Column({
    name: 'total_amount',
    type: 'numeric',
    precision: 15,
    scale: 2,
    nullable: true,
  })
  total_amount?: string;

  @Column({ name: 'invoice_number', length: 100, nullable: true })
  invoice_number?: string;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date;
}
