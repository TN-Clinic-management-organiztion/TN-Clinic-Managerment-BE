import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MedicalEncounter } from './medical_encounters.entity';
import { RefService } from '../service/ref_services.entity';

export enum EncounterClsStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

@Entity('encounter_cls_tracking')
export class EncounterClsTracking {
  @PrimaryGeneratedColumn('uuid', { name: 'track_id' })
  track_id: string;

  // --- RAW FKs ---
  @Column({ name: 'encounter_id', type: 'uuid', nullable: true })
  encounter_id?: string | null;

  @Column({ name: 'service_id', type: 'int', nullable: true })
  service_id?: number | null;

  // --- RELATIONS ---
  @ManyToOne(() => MedicalEncounter, { nullable: true })
  @JoinColumn({ name: 'encounter_id', referencedColumnName: 'encounter_id' })
  encounter?: MedicalEncounter;

  @ManyToOne(() => RefService, { nullable: true })
  @JoinColumn({ name: 'service_id', referencedColumnName: 'service_id' })
  service?: RefService;

  // --- COLUMNS ---
  @Column({
    name: 'status',
    type: 'enum',
    enum: EncounterClsStatus,
    default: EncounterClsStatus.PENDING,
  })
  status: EncounterClsStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completed_at?: Date;
}
