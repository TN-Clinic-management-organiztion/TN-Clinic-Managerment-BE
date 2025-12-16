import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StaffProfile } from '../auth/staff_profiles.entity';

@Entity('system_config')
export class SystemConfig {
  @PrimaryGeneratedColumn({ name: 'config_id' })
  config_id: number;

  // --- RAW FK ---
  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updated_by?: string | null;

  // --- RELATION ---
  @ManyToOne(() => StaffProfile, { nullable: true })
  @JoinColumn({ name: 'updated_by', referencedColumnName: 'staff_id' })
  updater?: StaffProfile;

  // --- COLUMNS ---
  @Column({ name: 'config_key', length: 100, unique: true })
  config_key: string;

  @Column({ name: 'config_value', length: 500 })
  config_value: string;

  @Column({ name: 'config_type', length: 50, default: 'GENERAL' })
  config_type: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updated_at: Date;
}
