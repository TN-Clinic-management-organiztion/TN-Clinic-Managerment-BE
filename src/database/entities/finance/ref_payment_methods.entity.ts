import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('ref_payment_methods')
export class RefPaymentMethod {
  @PrimaryColumn({ name: 'payment_method_code', length: 20 })
  paymentMethodCode: string; // 'CASH', 'BANK', 'CARD', 'MOMO', ...

  @Column({ name: 'method_name', length: 100 })
  methodName: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
