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
  result_id: string;

  // --- RAW FKs ---
  @Column({ name: 'request_item_id', type: 'uuid', nullable: true })
  request_item_id?: string | null;

  @Column({ name: 'technician_id', type: 'uuid', nullable: true })
  technician_id?: string | null;

  @Column({ name: 'approving_doctor_id', type: 'uuid', nullable: true })
  approving_doctor_id?: string | null;

  @Column({ name: 'used_template_id', type: 'int', nullable: true })
  used_template_id?: string;

  // --- RELATIONS ---
  @ManyToOne(() => ServiceRequestItem, { nullable: true })
  @JoinColumn({ name: 'request_item_id', referencedColumnName: 'item_id' })
  request_item?: ServiceRequestItem;

  @ManyToOne(() => StaffProfile, { nullable: true })
  @JoinColumn({ name: 'technician_id', referencedColumnName: 'staff_id' })
  technician?: StaffProfile;

  @ManyToOne(() => StaffProfile, { nullable: true })
  @JoinColumn({ name: 'approving_doctor_id', referencedColumnName: 'staff_id' })
  approving_doctor?: StaffProfile;

  @ManyToOne(() => ServiceReportTemplate, { nullable: true })
  @JoinColumn({ name: 'used_template_id', referencedColumnName: 'template_id' })
  used_template?: ServiceReportTemplate;

  // --- COLUMNS ---
  @Column({ name: 'main_conclusion', type: 'text', nullable: true })
  main_conclusion?: string;

  @Column({ name: 'report_body_html', type: 'text', nullable: true })
  report_body_html?: string;

  @Column({ name: 'is_abnormal', default: false })
  is_abnormal: boolean;

  @Column({ name: 'result_time', type: 'timestamptz', default: () => 'NOW()' })
  result_time: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deleted_at?: Date;
}
