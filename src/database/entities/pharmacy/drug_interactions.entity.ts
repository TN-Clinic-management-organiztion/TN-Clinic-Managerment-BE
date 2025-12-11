import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { RefDrug } from './ref_drugs.entity';

export enum DrugInteractionSeverity {
  MINOR = 'MINOR',
  MODERATE = 'MODERATE',
  MAJOR = 'MAJOR',
}

@Entity('drug_interactions')
@Unique('uq_interaction_pair', ['drug_a_id', 'drug_b_id'])
export class DrugInteraction {
  @PrimaryGeneratedColumn({ name: 'interaction_id' })
  interaction_id: number;

  // --- RAW FKs ---
  @Column({ name: 'drug_a_id', type: 'int' })
  drug_a_id: number;

  @Column({ name: 'drug_b_id', type: 'int' })
  drug_b_id: number;

  // --- RELATIONS ---
  @ManyToOne(() => RefDrug, { nullable: false })
  @JoinColumn({ name: 'drug_a_id', referencedColumnName: 'drug_id' })
  drug_a: RefDrug;

  @ManyToOne(() => RefDrug, { nullable: false })
  @JoinColumn({ name: 'drug_b_id', referencedColumnName: 'drug_id' })
  drug_b: RefDrug;

  // --- COLUMNS ---
  @Column({
    name: 'severity',
    type: 'enum',
    enum: DrugInteractionSeverity,
    nullable: true,
  })
  severity?: DrugInteractionSeverity;

  @Column({ name: 'warning_message', type: 'text', nullable: true })
  warning_message?: string;
}
