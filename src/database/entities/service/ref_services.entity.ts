import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RefServiceCategory } from './ref_service_categories.entity';

export enum ServiceResultInputType {
  NUMERIC = 'NUMERIC',                 // Chỉ số số (lab)
  TEXT = 'TEXT',                       // Chỉ kết luận text
  NUMERIC_AND_TEXT = 'NUMERIC_AND_TEXT', // Số + text
  IMAGE_AND_TEXT = 'IMAGE_AND_TEXT',   // Ảnh (XQ/CT/MRI..) + text
}

@Entity('ref_services')
export class RefService {
  @PrimaryGeneratedColumn({ name: 'service_id' })
  serviceId: number;

  @ManyToOne(() => RefServiceCategory, { nullable: true })
  @JoinColumn({ name: 'category_id', referencedColumnName: 'categoryId' })
  categoryId?: RefServiceCategory;

  @Column({ name: 'service_name', length: 255 })
  serviceName: string;

  @Column({ name: 'base_price', type: 'numeric', precision: 15, scale: 2, nullable: true })
  basePrice?: string;

  @Column({
    name: 'result_input_type',
    type: 'enum',
    enum: ServiceResultInputType,
    nullable: true,
  })
  resultInputType?: ServiceResultInputType;
}
