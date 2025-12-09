import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Invoice } from './invoices.entity';
import { ServiceRequestItem } from '../service/service_request_items.entity';
import { PrescriptionDetail } from '../pharmacy/prescription_details.entity';

export enum InvoiceItemType {
  CONSULTATION = 'CONSULTATION',
  SERVICE = 'SERVICE',
  DRUG = 'DRUG',
  OTHER = 'OTHER',
}

@Entity('invoice_items')
export class InvoiceItem {
  @PrimaryGeneratedColumn({
    name: 'invoice_item_id',
    type: 'bigint',
  })
  invoiceItemId: string;

  @ManyToOne(() => Invoice, { nullable: false })
  @JoinColumn({
    name: 'invoice_id',
    referencedColumnName: 'invoiceId',
  })
  invoiceId: Invoice;

  @Column({
    name: 'item_type',
    type: 'enum',
    enum: InvoiceItemType,
  })
  itemType: InvoiceItemType;

  // Nếu là dịch vụ CLS
  @ManyToOne(() => ServiceRequestItem, { nullable: true })
  @JoinColumn({
    name: 'service_item_id',
    referencedColumnName: 'itemId',
  })
  serviceItemId?: ServiceRequestItem;

  // Nếu là thuốc
  @ManyToOne(() => PrescriptionDetail, { nullable: true })
  @JoinColumn({
    name: 'prescription_detail_id',
    referencedColumnName: 'detailId',
  })
  prescriptionDetailId?: PrescriptionDetail;

  @Column({ name: 'description', type: 'text' })
  description: string;

  @Column({ name: 'quantity', type: 'int' })
  quantity: number;

  @Column({
    name: 'unit_price',
    type: 'numeric',
    precision: 15,
    scale: 2,
  })
  unitPrice: string;

  @Column({
    name: 'line_amount',
    type: 'numeric',
    precision: 15,
    scale: 2,
  })
  lineAmount: string;
}
