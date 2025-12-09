import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ResultImage } from '../service/result_images.entity';
import { StaffProfile } from '../auth/staff_profiles.entity';

export enum AnnotationSource {
  AI = 'AI',
  HUMAN = 'HUMAN',
}

export enum AnnotationStatus {
  DRAFT = 'DRAFT',
  REVIEWED = 'REVIEWED',
  APPROVED = 'APPROVED',
}

@Entity('image_annotations')
export class ImageAnnotation {
  @PrimaryGeneratedColumn('uuid', { name: 'annotation_id' })
  annotationId: string;

  @ManyToOne(() => ResultImage, { nullable: false })
  @JoinColumn({ name: 'image_id', referencedColumnName: 'imageId' })
  imageId: ResultImage;

  @Column({
    name: 'annotation_source',
    type: 'enum',
    enum: AnnotationSource,
  })
  annotationSource: AnnotationSource;

  @Column({
    name: 'annotation_data',
    type: 'jsonb',
  })
  annotationData: any;

  @Column({ name: 'ai_model_name', length: 100, nullable: true })
  aiModelName?: string;

  @Column({ name: 'ai_model_version', length: 50, nullable: true })
  aiModelVersion?: string;

  @ManyToOne(() => StaffProfile, { nullable: true })
  @JoinColumn({ name: 'labeled_by', referencedColumnName: 'staffId' })
  labeledBy?: StaffProfile;

  @Column({
    name: 'labeled_at',
    type: 'timestamptz',
    nullable: true,
  })
  labeledAt?: Date;

  @ManyToOne(() => StaffProfile, { nullable: true })
  @JoinColumn({ name: 'reviewed_by', referencedColumnName: 'staffId' })
  reviewedBy?: StaffProfile;

  @Column({
    name: 'reviewed_at',
    type: 'timestamptz',
    nullable: true,
  })
  reviewedAt?: Date;

  @ManyToOne(() => StaffProfile, { nullable: true })
  @JoinColumn({ name: 'approved_by', referencedColumnName: 'staffId' })
  approvedBy?: StaffProfile;

  @Column({
    name: 'approved_at',
    type: 'timestamptz',
    nullable: true,
  })
  approvedAt?: Date;

  @Column({
    name: 'annotation_status',
    type: 'enum',
    enum: AnnotationStatus,
    default: AnnotationStatus.DRAFT,
  })
  annotationStatus: AnnotationStatus;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt: Date;
}
