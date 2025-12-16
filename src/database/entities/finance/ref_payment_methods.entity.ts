import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('ref_payment_methods')
export class RefPaymentMethod {
  @PrimaryColumn({ name: 'payment_method_code', length: 20 })
  payment_method_code: string; // 'CASH', 'BANK', 'CARD', 'MOMO', ...

  @Column({ name: 'method_name', length: 100 })
  method_name: string;

  @Column({ name: 'is_active', default: true })
  is_active: boolean;
}