import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { StaffProfile } from '../auth/staff_profiles.entity';

export enum AnnotationTaskType {
  CLASSIFICATION = 'CLASSIFICATION',
  BOUNDING_BOX = 'BOUNDING_BOX',
  SEGMENTATION = 'SEGMENTATION',
  KEYPOINT = 'KEYPOINT',
  OCR = 'OCR',
  OTHER = 'OTHER',
}

@Entity('annotation_projects')
export class AnnotationProject {
  @PrimaryGeneratedColumn('uuid', { name: 'project_id' })
  projectId: string;

  @Column({ name: 'name', length: 255 })
  name: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({
    name: 'task_type',
    type: 'enum',
    enum: AnnotationTaskType,
  })
  taskType: AnnotationTaskType;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ManyToOne(() => StaffProfile, { nullable: true })
  @JoinColumn({ name: 'created_by', referencedColumnName: 'staffId' })
  createdBy?: StaffProfile;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt: Date;
}
