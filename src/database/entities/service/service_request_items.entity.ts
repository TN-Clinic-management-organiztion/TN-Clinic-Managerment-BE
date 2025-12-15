import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ServiceRequest } from './service_requests.entity';
import { RefService } from './ref_services.entity';

export enum ServiceItemStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('service_request_items')
export class ServiceRequestItem {
  @PrimaryGeneratedColumn('uuid', { name: 'item_id' })
  item_id: string;

  // --- RAW FKs ---
  @Column({ name: 'request_id', type: 'uuid', nullable: true })
  request_id?: string | null;

  @Column({ name: 'service_id', type: 'int', nullable: true })
  service_id?: number | null;

  // --- RELATIONS ---
  @ManyToOne(() => ServiceRequest, { nullable: true })
  @JoinColumn({ name: 'request_id', referencedColumnName: 'request_id' })
  request?: ServiceRequest;

  @ManyToOne(() => RefService, { nullable: true })
  @JoinColumn({ name: 'service_id', referencedColumnName: 'service_id' })
  service?: RefService;

  // --- COLUMNS ---
  @Column({
    name: 'status',
    type: 'enum',
    enum: ServiceItemStatus,
    default: ServiceItemStatus.PENDING,
  })
  status: ServiceItemStatus;
}