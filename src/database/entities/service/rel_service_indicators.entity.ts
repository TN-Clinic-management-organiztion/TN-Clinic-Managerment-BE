import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { RefService } from './ref_services.entity';
import { RefLabIndicator } from './ref_lab_indicators.entity';

@Entity('rel_service_indicators')
export class RelServiceIndicator {
  // --- KEYS (Raw IDs) ---
  @PrimaryColumn({ name: 'service_id' })
  service_id: number;

  @PrimaryColumn({ name: 'indicator_id' })
  indicator_id: number;

  // --- RELATIONS ---
  @ManyToOne(() => RefService)
  @JoinColumn({ name: 'service_id', referencedColumnName: 'service_id' })
  service: RefService;

  @ManyToOne(() => RefLabIndicator)
  @JoinColumn({ name: 'indicator_id', referencedColumnName: 'indicator_id' })
  indicator: RefLabIndicator;

  // --- COLUMNS ---
  @Column({ name: 'sort_order', type: 'int', nullable: true })
  sort_order?: number;
}