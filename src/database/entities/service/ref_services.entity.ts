import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RefServiceCategory } from './ref_service_categories.entity';

export enum ServiceResultInputType {
  NUMERIC = 'NUMERIC', // Chỉ số số (lab)
  TEXT = 'TEXT', // Chỉ kết luận text
  NUMERIC_AND_TEXT = 'NUMERIC_AND_TEXT', // Số + text
  IMAGE_AND_TEXT = 'IMAGE_AND_TEXT', // Ảnh (XQ/CT/MRI..) + text
}

@Entity('ref_services')
export class RefService {
  @PrimaryGeneratedColumn({ name: 'service_id' })
  service_id: number;

  // --- RAW FK ---
  @Column({ name: 'category_id', type: 'int', nullable: true })
  category_id?: number | null;

  // --- RELATION ---
  @ManyToOne(() => RefServiceCategory, { nullable: true })
  @JoinColumn({ name: 'category_id', referencedColumnName: 'category_id' })
  category?: RefServiceCategory;

  // --- COLUMNS ---
  @Column({ name: 'service_name', length: 255 })
  service_name: string;

  @Column({
    name: 'base_price',
    type: 'numeric',
    precision: 15,
    scale: 2,
    nullable: true,
  })
  base_price?: string | null;

  @Column({
    name: 'result_input_type',
    type: 'enum',
    enum: ServiceResultInputType,
    nullable: true,
  })
  result_input_type?: ServiceResultInputType;
}