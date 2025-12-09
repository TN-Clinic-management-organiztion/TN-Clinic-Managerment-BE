import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

import { MedicalEncounter } from '../clinical/medical_encounters.entity';
import { OrgRoom } from '../auth/org_rooms.entity';

export enum QueueTicketType {
  REGISTRATION = 'REGISTRATION',
  CONSULTATION = 'CONSULTATION',
  SERVICE = 'SERVICE',
}

export enum QueueSource {
  ONLINE = 'ONLINE',
  WALKIN = 'WALKIN',
}

export enum QueueStatus {
  WAITING = 'WAITING',
  CALLED = 'CALLED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED',
}

@Entity('queue_tickets')
export class QueueTicket {
  @PrimaryGeneratedColumn('uuid', { name: 'ticket_id' })
  ticketId: string;

  @ManyToOne(() => MedicalEncounter, { nullable: true })
  @JoinColumn({
    name: 'encounter_id',
    referencedColumnName: 'encounterId',
  })
  encounterId?: MedicalEncounter;

  @ManyToOne(() => OrgRoom, { nullable: false })
  @JoinColumn({
    name: 'room_id',
    referencedColumnName: 'roomId',
  })
  roomId: OrgRoom;

  @Column({
    name: 'ticket_type',
    type: 'enum',
    enum: QueueTicketType,
  })
  ticketType: QueueTicketType;

  @Column({ name: 'display_number', type: 'int' })
  displayNumber: number;

  @Column({
    name: 'source',
    type: 'enum',
    enum: QueueSource,
    default: QueueSource.WALKIN,
  })
  source: QueueSource;

  @Column({
    name: 'status',
    type: 'enum',
    enum: QueueStatus,
    default: QueueStatus.WAITING,
  })
  status: QueueStatus;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt: Date;

  @Column({ name: 'called_at', type: 'timestamptz', nullable: true })
  calledAt?: Date;

  @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
  startedAt?: Date;

  // INT ARRAY
  @Column({
    name: 'service_ids',
    type: 'int',
    array: true,
    nullable: true,
  })
  serviceIds?: number[];

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt?: Date;
}
