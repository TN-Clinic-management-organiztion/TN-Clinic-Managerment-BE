import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { AnnotationProject } from './annotation_projects.entity';
import { ResultImage } from '../service/result_images.entity';
import { StaffProfile } from '../auth/staff_profiles.entity';

@Entity('annotation_project_images')
export class AnnotationProjectImage {
  // Composite PK (project_id, image_id)
  @PrimaryColumn('uuid', { name: 'project_id' })
  projectId: string;

  @PrimaryColumn('uuid', { name: 'image_id' })
  imageId: string;

  @ManyToOne(() => AnnotationProject)
  @JoinColumn({
    name: 'project_id',
    referencedColumnName: 'projectId',
  })
  project: AnnotationProject;

  @ManyToOne(() => ResultImage)
  @JoinColumn({
    name: 'image_id',
    referencedColumnName: 'imageId',
  })
  image: ResultImage;

  @ManyToOne(() => StaffProfile, { nullable: true })
  @JoinColumn({ name: 'added_by', referencedColumnName: 'staffId' })
  addedBy?: StaffProfile;

  @CreateDateColumn({
    name: 'added_at',
    type: 'timestamptz',
  })
  addedAt: Date;
}
