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
  template_id: number;

  // --- RAW FKs ---
  @Column({ name: 'service_id', type: 'int', nullable: true })
  service_id?: number | null;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  created_by?: string | null;

  // --- RELATIONS ---
  @ManyToOne(() => RefService, { nullable: true })
  @JoinColumn({ name: 'service_id', referencedColumnName: 'service_id' })
  service?: RefService;

  @ManyToOne(() => StaffProfile, { nullable: true })
  @JoinColumn({ name: 'created_by', referencedColumnName: 'staff_id' })
  creator?: StaffProfile;

  // --- COLUMNS ---
  @Column({ name: 'template_name', length: 150 })
  template_name: string;

  @Column({ name: 'body_html', type: 'text' })
  body_html: string;

  @Column({ name: 'is_default', default: false })
  is_default: boolean;

  @Column({ name: 'is_public', default: false })
  is_public: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date;
}