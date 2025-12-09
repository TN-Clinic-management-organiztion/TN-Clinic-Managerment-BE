import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('ref_service_categories')
export class RefServiceCategory {
  @PrimaryGeneratedColumn({ name: 'category_id' })
  categoryId: number;

  @Column({ name: 'category_name', length: 255 })
  categoryName: string;

  @ManyToOne(() => RefServiceCategory, { nullable: true })
  @JoinColumn({ name: 'parent_id', referencedColumnName: 'categoryId' })
  parentId?: RefServiceCategory;

  @Column({ name: 'is_system_root', default: false })
  isSystemRoot: boolean;
}
