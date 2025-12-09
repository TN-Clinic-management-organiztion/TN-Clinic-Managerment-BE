import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('ref_drug_categories')
export class RefDrugCategory {
  @PrimaryGeneratedColumn({ name: 'category_id' })
  categoryId: number;

  @ManyToOne(() => RefDrugCategory, { nullable: true })
  @JoinColumn({ name: 'parent_id', referencedColumnName: 'categoryId' })
  parentId?: RefDrugCategory;

  @Column({ name: 'category_code', length: 20, nullable: true })
  categoryCode?: string;

  @Column({ name: 'category_name', length: 255 })
  categoryName: string;
}
