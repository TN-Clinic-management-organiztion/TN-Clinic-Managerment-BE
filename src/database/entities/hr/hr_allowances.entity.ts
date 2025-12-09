import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { StaffProfile } from '../auth/staff_profiles.entity';
import { SysRole } from '../auth/sys_roles.entity';

export enum AllowanceTargetType {
  INDIVIDUAL = 'INDIVIDUAL',
  GROUP = 'GROUP',
}

@Entity('hr_allowances')
export class HrAllowance {
  @PrimaryGeneratedColumn({ name: 'allowance_id' })
  allowanceId: number;

  @Column({ name: 'allowance_type', length: 50 })
  allowanceType: string;

  @Column({
    name: 'amount',
    type: 'numeric',
    precision: 10,
    scale: 2,
  })
  amount: string;

  @Column({
    name: 'target_type',
    type: 'enum',
    enum: AllowanceTargetType,
  })
  targetType: AllowanceTargetType;

  @ManyToOne(() => StaffProfile, { nullable: true })
  @JoinColumn({ name: 'staff_id', referencedColumnName: 'staffId' })
  staffId?: StaffProfile;

  @ManyToOne(() => SysRole, { nullable: true })
  @JoinColumn({ name: 'role_id', referencedColumnName: 'roleId' })
  roleId?: SysRole;

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate?: Date;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @ManyToOne(() => StaffProfile, { nullable: false })
  @JoinColumn({ name: 'created_by', referencedColumnName: 'staffId' })
  createdBy: StaffProfile;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt: Date;
}
