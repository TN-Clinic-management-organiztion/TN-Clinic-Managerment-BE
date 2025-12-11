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
  image_id: string;

  // --- RAW FKs ---
  @Column({ name: 'result_id', type: 'uuid', nullable: true })
  result_id?: string | null;

  @Column({ name: 'uploaded_by', type: 'uuid', nullable: true })
  uploaded_by?: string | null;

  // --- RELATIONS ---
  @ManyToOne(() => ServiceResult, { nullable: true })
  @JoinColumn({ name: 'result_id', referencedColumnName: 'result_id' })
  result?: ServiceResult;

  @ManyToOne(() => StaffProfile, { nullable: true })
  @JoinColumn({ name: 'uploaded_by', referencedColumnName: 'staff_id' })
  uploader?: StaffProfile;

  // --- COLUMNS ---
  @Column({ name: 'public_id', length: 255, nullable: true })
  public_id: string;

  @Column({ name: 'original_image_url', length: 500 })
  original_image_url: string;

  @Column({ name: 'file_name', length: 255, nullable: true })
  file_name?: string;

  @Column({ name: 'file_size', type: 'bigint', nullable: true })
  file_size?: string;

  @Column({ name: 'mime_type', length: 100, nullable: true })
  mime_type?: string;

  @CreateDateColumn({ name: 'uploaded_at', type: 'timestamptz' })
  uploaded_at: Date;
}
