import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ServiceRequestItem } from './service_request_items.entity';
import { StaffProfile } from '../auth/staff_profiles.entity';
import { ServiceReportTemplate } from './service_report_templates.entity';

@Entity('service_results')
export class ServiceResult {
  @PrimaryGeneratedColumn('uuid', { name: 'result_id' })
  resultId: string;

  @ManyToOne(() => ServiceRequestItem, { nullable: true })
  @JoinColumn({
    name: 'request_item_id',
    referencedColumnName: 'itemId',
  })
  requestItemId?: ServiceRequestItem;

  @ManyToOne(() => StaffProfile, { nullable: true })
  @JoinColumn({ name: 'technician_id', referencedColumnName: 'staffId' })
  technicianId?: StaffProfile;

  @ManyToOne(() => StaffProfile, { nullable: true })
  @JoinColumn({
    name: 'approving_doctor_id',
    referencedColumnName: 'staffId',
  })
  approvingDoctorId?: StaffProfile;

  @Column({ name: 'main_conclusion', type: 'text', nullable: true })
  mainConclusion?: string;

  @Column({ name: 'report_body_html', type: 'text', nullable: true })
  reportBodyHtml?: string;

  @ManyToOne(() => ServiceReportTemplate, { nullable: true })
  @JoinColumn({
    name: 'used_template_id',
    referencedColumnName: 'templateId',
  })
  usedTemplateId?: ServiceReportTemplate;

  @Column({ name: 'is_abnormal', default: false })
  isAbnormal: boolean;

  @Column({
    name: 'result_time',
    type: 'timestamptz',
    default: () => 'NOW()',
  })
  resultTime: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamptz',
    nullable: true,
  })
  deletedAt?: Date;
}
