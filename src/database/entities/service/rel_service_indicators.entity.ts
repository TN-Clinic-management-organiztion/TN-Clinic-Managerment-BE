import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { RefService } from './ref_services.entity';
import { RefLabIndicator } from './ref_lab_indicators.entity';

@Entity('rel_service_indicators')
export class RelServiceIndicator {
  @PrimaryColumn({ name: 'service_id' })
  serviceId: number;

  @PrimaryColumn({ name: 'indicator_id' })
  indicatorId: number;

  @ManyToOne(() => RefService)
  @JoinColumn({ name: 'service_id', referencedColumnName: 'serviceId' })
  service: RefService;

  @ManyToOne(() => RefLabIndicator)
  @JoinColumn({ name: 'indicator_id', referencedColumnName: 'indicatorId' })
  indicator: RefLabIndicator;

  @Column({ name: 'sort_order', type: 'int', nullable: true })
  sortOrder?: number;
}