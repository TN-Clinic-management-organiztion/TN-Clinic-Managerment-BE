import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Invoice } from './invoices.entity';
import { RefPaymentMethod } from './ref_payment_methods.entity';

@Entity('invoice_payments')
export class InvoicePayment {
  @PrimaryGeneratedColumn('uuid', { name: 'payment_id' })
  paymentId: string;

  @ManyToOne(() => Invoice, { nullable: false })
  @JoinColumn({
    name: 'invoice_id',
    referencedColumnName: 'invoiceId',
  })
  invoiceId: Invoice;

  @ManyToOne(() => RefPaymentMethod, { nullable: false })
  @JoinColumn({
    name: 'payment_method_code',
    referencedColumnName: 'paymentMethodCode',
  })
  paymentMethod: RefPaymentMethod;

  @Column({
    name: 'amount',
    type: 'numeric',
    precision: 15,
    scale: 2,
  })
  amount: string;

  @CreateDateColumn({
    name: 'paid_at',
    type: 'timestamptz',
  })
  paidAt: Date;

  @Column({ name: 'transaction_ref', length: 100, nullable: true })
  transactionRef?: string;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes?: string;
}
