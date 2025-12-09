import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('hr_shifts')
export class HrShift {
  @PrimaryGeneratedColumn({ name: 'shift_id' })
  shiftId: number;

  @Column({ name: 'shift_name', length: 50, nullable: true })
  shiftName?: string;

  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  @Column({ name: 'end_time', type: 'time' })
  endTime: string;

  @Column({ name: 'break_start', type: 'time', nullable: true })
  breakStart?: string;

  @Column({ name: 'break_end', type: 'time', nullable: true })
  breakEnd?: string;

  @Column({
    name: 'work_day_credit',
    type: 'numeric',
    precision: 3,
    scale: 2,
    default: 1.0,
  })
  workDayCredit: string;
}
