import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('ref_lab_indicators')
export class RefLabIndicator {
  @PrimaryGeneratedColumn({ name: 'indicator_id' })
  indicator_id: number;

  @Column({ name: 'indicator_code', length: 50, nullable: true })
  indicator_code?: string;

  @Column({ name: 'indicator_name', length: 200 })
  indicator_name: string;

  @Column({ name: 'unit', length: 50, nullable: true })
  unit?: string;

  @Column({
    name: 'ref_min_male',
    type: 'numeric',
    precision: 10,
    scale: 4,
    nullable: true,
  })
  ref_min_male?: string;

  @Column({
    name: 'ref_max_male',
    type: 'numeric',
    precision: 10,
    scale: 4,
    nullable: true,
  })
  ref_max_male?: string;

  @Column({
    name: 'ref_min_female',
    type: 'numeric',
    precision: 10,
    scale: 4,
    nullable: true,
  })
  ref_min_female?: string;

  @Column({
    name: 'ref_max_female',
    type: 'numeric',
    precision: 10,
    scale: 4,
    nullable: true,
  })
  ref_max_female?: string;
}
