import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ServiceResult } from './service_results.entity';
import { StaffProfile } from '../auth/staff_profiles.entity';

@Entity('result_images')
export class ResultImage {
  @PrimaryGeneratedColumn('uuid', { name: 'image_id' })
  imageId: string;

  @ManyToOne(() => ServiceResult, { nullable: true })
  @JoinColumn({ name: 'result_id', referencedColumnName: 'resultId' })
  resultId?: ServiceResult;

  @Column({ name: 'original_image_url', length: 500 })
  originalImageUrl: string;

  @Column({ name: 'file_name', length: 255, nullable: true })
  fileName?: string;

  @Column({ name: 'file_size', type: 'bigint', nullable: true })
  fileSize?: string;

  @Column({ name: 'mime_type', length: 100, nullable: true })
  mimeType?: string;

  @CreateDateColumn({
    name: 'uploaded_at',
    type: 'timestamptz',
  })
  uploadedAt: Date;

  @ManyToOne(() => StaffProfile, { nullable: true })
  @JoinColumn({ name: 'uploaded_by', referencedColumnName: 'staffId' })
  uploadedBy?: StaffProfile;
}
