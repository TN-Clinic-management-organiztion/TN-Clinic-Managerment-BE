import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ResultImage } from '../service/result_images.entity';
import { StaffProfile } from '../auth/staff_profiles.entity';

export enum AnnotationSource { AI = 'AI', HUMAN = 'HUMAN' }
export enum AnnotationStatus { DRAFT = 'DRAFT', REVIEWED = 'REVIEWED', APPROVED = 'APPROVED' }

@Entity('image_annotations')
export class ImageAnnotation {
  @PrimaryGeneratedColumn('uuid', { name: 'annotation_id' })
  annotation_id: string;

  // --- RAW FKs ---
  @Column({ name: 'image_id', type: 'uuid' })
  image_id: string;

  @Column({ name: 'labeled_by', type: 'uuid', nullable: true })
  labeled_by?: string | null;

  @Column({ name: 'reviewed_by', type: 'uuid', nullable: true })
  reviewed_by?: string | null;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approved_by?: string | null;

  // --- RELATIONS ---
  @ManyToOne(() => ResultImage, { nullable: false })
  @JoinColumn({ name: 'image_id', referencedColumnName: 'image_id' })
  image: ResultImage;

  @ManyToOne(() => StaffProfile, { nullable: true })
  @JoinColumn({ name: 'labeled_by', referencedColumnName: 'staff_id' })
  labeled_by_staff?: StaffProfile;

  @ManyToOne(() => StaffProfile, { nullable: true })
  @JoinColumn({ name: 'reviewed_by', referencedColumnName: 'staff_id' })
  reviewed_by_staff?: StaffProfile;

  @ManyToOne(() => StaffProfile, { nullable: true })
  @JoinColumn({ name: 'approved_by', referencedColumnName: 'staff_id' })
  approved_by_staff?: StaffProfile;

  // --- COLUMNS ---
  @Column({ name: 'annotation_source', type: 'enum', enum: AnnotationSource })
  annotation_source: AnnotationSource;

  @Column({ name: 'annotation_data', type: 'jsonb' })
  annotation_data: any;

  @Column({ name: 'ai_model_name', length: 100, nullable: true })
  ai_model_name?: string | null;

  @Column({ name: 'ai_model_version', length: 50, nullable: true })
  ai_model_version?: string | null;

  @Column({ name: 'labeled_at', type: 'timestamptz', nullable: true })
  labeled_at?: Date | null;

  @Column({ name: 'reviewed_at', type: 'timestamptz', nullable: true })
  reviewed_at?: Date | null;

  @Column({ name: 'approved_at', type: 'timestamptz', nullable: true })
  approved_at?: Date | null;

  @Column({ name: 'annotation_status', type: 'enum', enum: AnnotationStatus, default: AnnotationStatus.DRAFT })
  annotation_status: AnnotationStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date;
}