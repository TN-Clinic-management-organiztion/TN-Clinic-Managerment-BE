import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { MedicalEncounter } from '../clinical/medical_encounters.entity';
import { OrgRoom } from '../auth/org_rooms.entity';
import { OnlineAppointment } from './online_appointments.entity';

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
@Index(
  'uq_queue_ticket_appointment',
  ['appointment_id'],
  { unique: true, where: `"appointment_id" IS NOT NULL` } // Postgres partial unique index
)
@Entity('queue_tickets')
export class QueueTicket {
  @PrimaryGeneratedColumn('uuid', { name: 'ticket_id' })
  ticket_id: string;

  // --- RAW FKs ---
  @Column({ name: 'appointment_id', type: 'uuid', nullable: true })
  appointment_id?: string | null;

  @Column({ name: 'encounter_id', type: 'uuid', nullable: true })
  encounter_id?: string | null;

  @Column({ name: 'room_id', type: 'int' })
  room_id: number;

  // --- RELATIONS ---
  @ManyToOne(() => OnlineAppointment, { nullable: true })
  @JoinColumn({
    name: 'appointment_id',
    referencedColumnName: 'appointment_id',
  })
  appointment?: OnlineAppointment;

  @ManyToOne(() => MedicalEncounter, { nullable: true })
  @JoinColumn({ name: 'encounter_id', referencedColumnName: 'encounter_id' })
  encounter?: MedicalEncounter;

  @ManyToOne(() => OrgRoom, { nullable: false })
  @JoinColumn({ name: 'room_id', referencedColumnName: 'room_id' })
  room: OrgRoom;

  // --- COLUMNS ---
  @Column({ name: 'ticket_type', type: 'enum', enum: QueueTicketType })
  ticket_type: QueueTicketType;

  @Column({ name: 'display_number', type: 'int' })
  display_number: number;

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

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date;

  @Column({ name: 'called_at', type: 'timestamptz', nullable: true })
  called_at?: Date;

  @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
  started_at?: Date;

  @Column({ name: 'service_ids', type: 'int', array: true, nullable: true })
  service_ids?: number[];

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completed_at?: Date;
}
