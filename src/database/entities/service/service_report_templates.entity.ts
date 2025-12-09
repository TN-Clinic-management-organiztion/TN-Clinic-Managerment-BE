import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RefService } from './ref_services.entity';
import { StaffProfile } from '../auth/staff_profiles.entity';

@Entity('service_report_templates')
export class ServiceReportTemplate {
  @PrimaryGeneratedColumn({ name: 'template_id' })
  templateId: number;

  @ManyToOne(() => RefService, { nullable: true })
  @JoinColumn({ name: 'service_id', referencedColumnName: 'serviceId' })
  serviceId?: RefService;

  @ManyToOne(() => StaffProfile, { nullable: true })
  @JoinColumn({ name: 'created_by', referencedColumnName: 'staffId' })
  createdBy?: StaffProfile;

  @Column({ name: 'template_name', length: 150 })
  templateName: string;

  @Column({ name: 'body_html', type: 'text' })
  bodyHtml: string;

  @Column({ name: 'is_default', default: false })
  isDefault: boolean;

  @Column({ name: 'is_public', default: false })
  isPublic: boolean;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt: Date;
}
