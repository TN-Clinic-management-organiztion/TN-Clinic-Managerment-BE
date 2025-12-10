import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { StaffProfile } from '../auth/staff_profiles.entity';

@Entity('hr_salary_config')
@Unique('uk_staff_effective_date', ['staff_id', 'effective_date'])
export class HrSalaryConfig {
  @PrimaryGeneratedColumn({ name: 'config_id' })
  config_id: number;

  // --- RAW FKs ---
  @Column({ name: 'staff_id', type: 'uuid' })
  staff_id: string;

  // --- RELATIONS ---
  @ManyToOne(() => StaffProfile, { nullable: false })
  @JoinColumn({ name: 'staff_id', referencedColumnName: 'staff_id' })
  staff: StaffProfile;

  // --- COLUMNS ---
  @Column({ name: 'base_salary', type: 'numeric', precision: 10, scale: 2 })
  base_salary: string;

  @Column({ name: 'standard_days_per_month', type: 'smallint', default: 26 })
  standard_days_per_month: number;

  @Column({ name: 'effective_date', type: 'date', default: () => 'CURRENT_DATE' })
  effective_date: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  end_date?: Date | null;
}