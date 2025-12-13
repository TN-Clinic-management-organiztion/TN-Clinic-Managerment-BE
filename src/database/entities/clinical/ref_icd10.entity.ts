import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity('ref_icd10')
export class RefIcd10 {
  @PrimaryColumn({ name: 'icd_code', length: 10 })
  icd_code: string;

  // --- RAW FKs ---
  @Column({ name: 'parent_code', length: 10, nullable: true })
  parent_code?: string;

  // --- RELATIONS ---
  @ManyToOne(() => RefIcd10, { nullable: true, onUpdate: 'CASCADE', onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'parent_code', referencedColumnName: 'icd_code' })
  parent?: RefIcd10;

  // --- COLUMNS ---
  @Column({ name: 'name_vi', length: 500 })
  name_vi: string;

  @Column({ name: 'name_en', length: 500, nullable: true })
  name_en?: string;

  @Column({ name: 'level', type: 'int', nullable: true })
  level?: number;

  @Column({ name: 'is_leaf', default: false })
  is_leaf: boolean;

  @Column({ name: 'active', default: true })
  active: boolean;
}