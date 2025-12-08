import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('ref_specialties')
export class RefSpecialty {
  @PrimaryGeneratedColumn({ name: 'specialty_id' })
  specialtyId: number;

  @Column({ name: 'specialty_code', length: 50, unique: true })
  specialtyCode: string;

  @Column({ name: 'specialty_name', length: 255 })
  specialtyName: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
