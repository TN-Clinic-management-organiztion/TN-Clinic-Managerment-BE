import { PatientProfile } from 'src/database/entities/auth/patient_profiles.entity';
import { StaffProfile } from 'src/database/entities/auth/staff_profiles.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('sys_users')
export class SysUser {
  @PrimaryGeneratedColumn('uuid', { name: 'user_id' })
  user_id: string;

  @Index()
  @Column({ name: 'username', length: 100, unique: true, nullable: true })
  username?: string;

  @Column({
    name: 'password',
    length: 255,
    select: false,
    nullable: true,
  })
  password?: string;

  @Column({ name: 'email', length: 150, nullable: true })
  email?: string;

  @Column({ name: 'phone', length: 20, nullable: true })
  phone?: string;

  @Index()
  @Column({
    name: 'cccd',
    type: 'varchar',
    length: 12,
    unique: true,
    nullable: true,
  })
  cccd?: string | null;

  @Column({ name: 'is_active', default: true })
  is_active: boolean;

  // Refresh token hash (không lưu token gốc)
  @Column({
    name: 'refresh_token_hash',
    type: 'varchar',
    length: 255,
    nullable: true,
    select: false,
  })
  refresh_token_hash?: string | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  created_at: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamptz',
    nullable: true,
  })
  deleted_at?: Date;

  @OneToOne(() => PatientProfile, (p) => p.user)
  patientProfile?: PatientProfile;

  @OneToOne(() => StaffProfile, (s) => s.user)
  staffProfile?: StaffProfile;
}
