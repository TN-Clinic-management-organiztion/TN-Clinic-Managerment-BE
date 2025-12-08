import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { SysUser } from './sys_users.entity';

export enum Gender {
  NAM = 'NAM',
  NU = 'NU',
  KHAC = 'KHAC',
}

@Entity('patient_profiles')
export class PatientProfile {
  // PK + FK -> sys_users.user_id
  @PrimaryColumn('uuid', { name: 'patient_id' })
  patientId: string;

  @Column({ name: 'full_name', length: 255 })
  fullName: string;

  @Column({ name: 'dob', type: 'date' })
  dob: Date;

  @Column({
    name: 'gender',
    type: 'enum',
    enum: Gender,
  })
  gender: Gender;

  @Column({ name: 'address', type: 'text', nullable: true })
  address?: string;

  @Column({ name: 'medical_history', type: 'text', nullable: true })
  medicalHistory?: string;

  @Column({ name: 'allergy_history', type: 'text', nullable: true })
  allergyHistory?: string;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date;

  // patient_id -> sys_users.user_id
  @OneToOne(() => SysUser)
  @JoinColumn({ name: 'patient_id', referencedColumnName: 'userId' })
  user: SysUser;
}
