import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { StaffProfile } from '../auth/staff_profiles.entity';

@Entity('drug_imports')
export class DrugImport {
  @PrimaryGeneratedColumn({ name: 'import_id' })
  import_id: number;

  // --- RAW FKs ---
  @Column({ name: 'imported_by', type: 'uuid', nullable: true })
  imported_by?: string | null;

  // --- RELATIONS ---
  @ManyToOne(() => StaffProfile, { nullable: true })
  @JoinColumn({ name: 'imported_by', referencedColumnName: 'staff_id' })
  importer?: StaffProfile;

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
