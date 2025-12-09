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
  detailId: string;

  @ManyToOne(() => ServiceResult, { nullable: true })
  @JoinColumn({ name: 'result_id', referencedColumnName: 'resultId' })
  resultId?: ServiceResult;

  @ManyToOne(() => RefLabIndicator, { nullable: true })
  @JoinColumn({
    name: 'indicator_id',
    referencedColumnName: 'indicatorId',
  })
  indicatorId?: RefLabIndicator;

  @Column({
    name: 'value_measured',
    type: 'numeric',
    precision: 10,
    scale: 4,
    nullable: true,
  })
  valueMeasured?: string;

  @Column({ name: 'is_critical', default: false })
  isCritical: boolean;
}
