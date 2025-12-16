import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('hr_shifts')
export class HrShift {
  @PrimaryGeneratedColumn({ name: 'shift_id' })
  shift_id: number;

  @Column({ name: 'shift_name', length: 50, nullable: true })
  shift_name?: string;

  @Column({ name: 'start_time', type: 'time' })
  start_time: string;

  @Column({ name: 'end_time', type: 'time' })
  end_time: string;

  @Column({ name: 'break_start', type: 'time', nullable: true })
  break_start?: string;

  @Column({ name: 'break_end', type: 'time', nullable: true })
  break_end?: string;

  @Column({
    name: 'work_day_credit',
    type: 'numeric',
    precision: 3,
    scale: 2,
    default: 1.0,
  })
  work_day_credit: string;
}
