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
  MINOR = 'MINOR', // Nhỏ
  MODERATE = 'MODERATE', // Vừa
  MAJOR = 'MAJOR', // Nghiêm trọng
}

@Entity('drug_interactions')
@Unique('uq_interaction_pair', ['drugAId', 'drugBId'])
export class DrugInteraction {
  @PrimaryGeneratedColumn({ name: 'interaction_id' })
  interactionId: number;

  @ManyToOne(() => RefDrug, { nullable: false })
  @JoinColumn({ name: 'drug_a_id', referencedColumnName: 'drugId' })
  drugAId: RefDrug;

  @ManyToOne(() => RefDrug, { nullable: false })
  @JoinColumn({ name: 'drug_b_id', referencedColumnName: 'drugId' })
  drugBId: RefDrug;

  @Column({
    name: 'severity',
    type: 'enum',
    enum: DrugInteractionSeverity,
    nullable: true, // DB chưa CHECK, có thể null
  })
  severity?: DrugInteractionSeverity;

  @Column({ name: 'warning_message', type: 'text', nullable: true })
  warningMessage?: string;
}
