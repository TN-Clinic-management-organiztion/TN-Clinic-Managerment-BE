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
  trackId: string;

  @ManyToOne(() => MedicalEncounter, { nullable: true })
  @JoinColumn({ name: 'encounter_id', referencedColumnName: 'encounterId' })
  encounterId?: MedicalEncounter;

  @ManyToOne(() => RefService, { nullable: true })
  @JoinColumn({ name: 'service_id', referencedColumnName: 'serviceId' })
  serviceId?: RefService;

  @Column({
    name: 'status',
    type: 'enum',
    enum: EncounterClsStatus,
    default: EncounterClsStatus.PENDING,
  })
  status: EncounterClsStatus;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt: Date;

  @Column({
    name: 'completed_at',
    type: 'timestamptz',
    nullable: true,
  })
  completedAt?: Date;
}
