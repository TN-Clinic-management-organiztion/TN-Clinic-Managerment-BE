import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

@Entity('ref_icd10')
export class RefIcd10 {
  @PrimaryColumn({ name: 'icd_code', length: 10 })
  icdCode: string;

  @Column({ name: 'name_vi', length: 500 })
  nameVi: string;

  @Column({ name: 'name_en', length: 500, nullable: true })
  nameEn?: string;

  @ManyToOne(() => RefIcd10, { nullable: true })
  @JoinColumn({ name: 'parent_code', referencedColumnName: 'icdCode' })
  parent?: RefIcd10;

  @Column({ name: 'level', type: 'int', nullable: true })
  level?: number;

  @Column({ name: 'is_leaf', default: false })
  isLeaf: boolean;

  @Column({ name: 'active', default: true })
  active: boolean;
}
