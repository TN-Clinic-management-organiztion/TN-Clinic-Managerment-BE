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
  configId: number;

  @Column({ name: 'config_key', length: 100, unique: true })
  configKey: string;

  @Column({ name: 'config_value', length: 500 })
  configValue: string;

  @Column({ name: 'config_type', length: 50, default: 'GENERAL' })
  configType: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt: Date;

  @ManyToOne(() => StaffProfile, { nullable: true })
  @JoinColumn({ name: 'updated_by', referencedColumnName: 'staffId' })
  updatedBy?: StaffProfile;
}
