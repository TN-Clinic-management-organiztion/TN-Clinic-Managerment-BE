import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ServiceResult } from './service_results.entity';
import { RefLabIndicator } from './ref_lab_indicators.entity';

@Entity('result_details_numeric')
export class ResultDetailNumeric {
  @PrimaryGeneratedColumn('increment', { name: 'detail_id', type: 'bigint' })
  detail_id: string;

  // --- RAW FKs ---
  @Column({ name: 'result_id', type: 'uuid', nullable: true })
  result_id?: string | null;

  @Column({ name: 'indicator_id', type: 'int', nullable: true })
  indicator_id?: number | null;

  // --- RELATIONS ---
  @ManyToOne(() => ServiceResult, { nullable: true })
  @JoinColumn({ name: 'result_id', referencedColumnName: 'result_id' })
  result?: ServiceResult;

  @ManyToOne(() => RefLabIndicator, { nullable: true })
  @JoinColumn({ name: 'indicator_id', referencedColumnName: 'indicator_id' })
  indicator?: RefLabIndicator;

  // --- COLUMNS ---
  @Column({
    name: 'value_measured',
    type: 'numeric',
    precision: 10,
    scale: 4,
    nullable: true,
  })
  value_measured?: string | null;

  @Column({ name: 'is_critical', default: false })
  is_critical: boolean;
}