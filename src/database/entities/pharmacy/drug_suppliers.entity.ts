import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('drug_suppliers')
export class DrugSupplier {
  @PrimaryGeneratedColumn({ name: 'supplier_id' })
  supplier_id: number;

  @Column({ name: 'supplier_name', length: 255 })
  supplier_name: string;

  @Column({ name: 'contact_person', length: 100, nullable: true })
  contact_person?: string;

  @Column({ name: 'phone', length: 20, nullable: true })
  phone?: string;

  @Column({ name: 'email', length: 150, nullable: true })
  email?: string;

  @Column({ name: 'address', type: 'text', nullable: true })
  address?: string;

  @Column({ name: 'is_active', default: true })
  is_active: boolean;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  created_at: Date;
}
