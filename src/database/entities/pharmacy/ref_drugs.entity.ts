import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { RefDrugCategory } from './ref_drug_categories.entity';

@Entity('ref_drugs')
export class RefDrug {
  @PrimaryGeneratedColumn({ name: 'drug_id' })
  drug_id: number;

  // --- RAW FKs ---
  @Column({ name: 'category_id', type: 'int', nullable: true })
  category_id?: number | null;

  // --- RELATIONS ---
  @ManyToOne(() => RefDrugCategory, { nullable: true })
  @JoinColumn({ name: 'category_id', referencedColumnName: 'category_id' })
  category?: RefDrugCategory;

  // --- COLUMNS ---
  @Column({ name: 'drug_name', length: 255 })
  drug_name: string;

  @Column({ name: 'active_ingredient', length: 255, nullable: true })
  active_ingredient?: string | null;

  @Column({ name: 'drug_code', length: 50, unique: true, nullable: true })
  drug_code?: string | null;

  @Column({ name: 'dosage_form', length: 50, nullable: true })
  dosage_form?: string | null;

  @Column({ name: 'route', length: 50, nullable: true })
  route?: string | null;

  @Column({ name: 'strength', length: 50, nullable: true })
  strength?: string | null;

  @Column({ name: 'unit_name', length: 50, nullable: true })
  unit_name?: string | null;

  @Column({ name: 'reorder_level', type: 'int', nullable: true })
  reorder_level?: number | null;

  @Column({ name: 'is_active', default: true })
  is_active: boolean;
}