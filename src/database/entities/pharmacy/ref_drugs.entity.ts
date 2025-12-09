import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RefDrugCategory } from './ref_drug_categories.entity';

@Entity('ref_drugs')
export class RefDrug {
  @PrimaryGeneratedColumn({ name: 'drug_id' })
  drugId: number;

  @ManyToOne(() => RefDrugCategory, { nullable: true })
  @JoinColumn({ name: 'category_id', referencedColumnName: 'categoryId' })
  categoryId?: RefDrugCategory;

  @Column({ name: 'drug_name', length: 255 })
  drugName: string;

  @Column({ name: 'active_ingredient', length: 255, nullable: true })
  activeIngredient?: string;

  @Column({ name: 'drug_code', length: 50, unique: true, nullable: true })
  drugCode?: string;

  @Column({ name: 'dosage_form', length: 50, nullable: true })
  dosageForm?: string;

  @Column({ name: 'route', length: 50, nullable: true })
  route?: string;

  @Column({ name: 'strength', length: 50, nullable: true })
  strength?: string;

  @Column({ name: 'unit_name', length: 50, nullable: true })
  unitName?: string;

  @Column({ name: 'reorder_level', type: 'int', nullable: true })
  reorderLevel?: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
