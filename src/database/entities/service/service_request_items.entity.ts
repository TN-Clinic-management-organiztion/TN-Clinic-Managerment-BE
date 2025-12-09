import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ServiceRequest } from './service_requests.entity';
import { RefService } from './ref_services.entity';

export enum ServiceRequestItemStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('service_request_items')
export class ServiceRequestItem {
  @PrimaryGeneratedColumn('uuid', { name: 'item_id' })
  itemId: string;

  @ManyToOne(() => ServiceRequest, { nullable: true })
  @JoinColumn({ name: 'request_id', referencedColumnName: 'requestId' })
  requestId?: ServiceRequest;

  @ManyToOne(() => RefService, { nullable: true })
  @JoinColumn({ name: 'service_id', referencedColumnName: 'serviceId' })
  serviceId?: RefService;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ServiceRequestItemStatus,
    default: ServiceRequestItemStatus.PENDING,
  })
  status: ServiceRequestItemStatus;
}
