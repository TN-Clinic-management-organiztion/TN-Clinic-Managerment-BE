import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('ref_drug_categories')
export class RefDrugCategory {
  @PrimaryGeneratedColumn({ name: 'category_id' })
  category_id: number;

  // --- RAW FKs ---
  @Column({ name: 'parent_id', type: 'int', nullable: true })
  parent_id?: number | null;

  // --- RELATIONS ---
  @ManyToOne(() => RefDrugCategory, { nullable: true })
  @JoinColumn({ name: 'parent_id', referencedColumnName: 'category_id' })
  parent?: RefDrugCategory;

  // --- COLUMNS ---
  @Column({ name: 'category_code', length: 20, nullable: true })
  category_code?: string | null;

  @Column({ name: 'category_name', length: 255 })
  category_name: string;
}