import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Invoice } from './invoices.entity';
import { ServiceRequestItem } from '../service/service_request_items.entity';

export enum InvoiceItemType {
  CONSULTATION = 'CONSULTATION',
  SERVICE = 'SERVICE',
  OTHER = 'OTHER',
}

@Entity('invoice_items')
export class InvoiceItem {
  @PrimaryGeneratedColumn({ name: 'invoice_item_id', type: 'bigint' })
  invoice_item_id: string;

  // --- RAW FKs ---
  @Column({ name: 'invoice_id', type: 'uuid' })
  invoice_id: string;

  @Column({ name: 'service_item_id', type: 'uuid', nullable: true })
  service_item_id?: string | null;

  // --- RELATIONS ---
  @ManyToOne(() => Invoice, { nullable: false })
  @JoinColumn({ name: 'invoice_id', referencedColumnName: 'invoice_id' })
  invoice: Invoice;

  @ManyToOne(() => ServiceRequestItem, { nullable: true })
  @JoinColumn({ name: 'service_item_id', referencedColumnName: 'item_id' })
  service_item?: ServiceRequestItem;

  // --- COLUMNS ---
  @Column({ name: 'item_type', type: 'enum', enum: InvoiceItemType })
  item_type: InvoiceItemType;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'quantity', type: 'int' })
  quantity: number;

  @Column({ name: 'unit_price', type: 'numeric', precision: 15, scale: 2 })
  unit_price: string;

  @Column({ name: 'line_amount', type: 'numeric', precision: 15, scale: 2 })
  line_amount: string;
}
