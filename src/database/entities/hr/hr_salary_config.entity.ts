import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { StaffProfile } from '../auth/staff_profiles.entity';

@Entity('hr_salary_config')
@Unique('uk_staff_effective_date', ['staffId', 'effectiveDate'])
export class HrSalaryConfig {
  @PrimaryGeneratedColumn({ name: 'config_id' })
  configId: number;

  @ManyToOne(() => StaffProfile, { nullable: false })
  @JoinColumn({ name: 'staff_id', referencedColumnName: 'staffId' })
  staffId: StaffProfile;

  @Column({
    name: 'base_salary',
    type: 'numeric',
    precision: 10,
    scale: 2,
  })
  baseSalary: string;

  @Column({
    name: 'standard_days_per_month',
    type: 'smallint',
    default: 26,
  })
  standardDaysPerMonth: number;

  @Column({
    name: 'effective_date',
    type: 'date',
    default: () => 'CURRENT_DATE',
  })
  effectiveDate: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate?: Date;
}
