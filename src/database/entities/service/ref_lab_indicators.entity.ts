import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('ref_lab_indicators')
export class RefLabIndicator {
  @PrimaryGeneratedColumn({ name: 'indicator_id' })
  indicatorId: number;

  @Column({ name: 'indicator_code', length: 50, nullable: true })
  indicatorCode?: string;

  @Column({ name: 'indicator_name', length: 200 })
  indicatorName: string;

  @Column({ name: 'unit', length: 50, nullable: true })
  unit?: string;

  @Column({ name: 'ref_min_male', type: 'numeric', precision: 10, scale: 4, nullable: true })
  refMinMale?: string;

  @Column({ name: 'ref_max_male', type: 'numeric', precision: 10, scale: 4, nullable: true })
  refMaxMale?: string;

  @Column({ name: 'ref_min_female', type: 'numeric', precision: 10, scale: 4, nullable: true })
  refMinFemale?: string;

  @Column({ name: 'ref_max_female', type: 'numeric', precision: 10, scale: 4, nullable: true })
  refMaxFemale?: string;
}
