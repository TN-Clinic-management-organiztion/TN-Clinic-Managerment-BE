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
  payment_id: string;

  // --- RAW FKs ---
  @Column({ name: 'invoice_id', type: 'uuid' })
  invoice_id: string;

  @Column({ name: 'payment_method_code', length: 20 })
  payment_method_code: string;

  // --- RELATIONS ---
  @ManyToOne(() => Invoice, { nullable: false })
  @JoinColumn({ name: 'invoice_id', referencedColumnName: 'invoice_id' })
  invoice: Invoice;

  @ManyToOne(() => RefPaymentMethod, { nullable: false })
  @JoinColumn({
    name: 'payment_method_code',
    referencedColumnName: 'payment_method_code',
  })
  payment_method: RefPaymentMethod;

  // --- COLUMNS ---
  @Column({ name: 'amount', type: 'numeric', precision: 15, scale: 2 })
  amount: string;

  @CreateDateColumn({ name: 'paid_at', type: 'timestamptz' })
  paid_at: Date;

  @Column({ name: 'transaction_ref', length: 100, nullable: true })
  transaction_ref?: string;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes?: string;
}
