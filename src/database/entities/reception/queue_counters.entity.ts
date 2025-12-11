import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { OrgRoom } from '../auth/org_rooms.entity';

export enum CounterTicketType {
  REGISTRATION = 'REGISTRATION',
  CONSULTATION = 'CONSULTATION',
  SERVICE = 'SERVICE',
}

@Entity('queue_counters')
export class QueueCounter {
  @PrimaryGeneratedColumn({ name: 'counter_id' })
  counter_id: number;

  // --- RAW FK ---
  @Column({ name: 'room_id', type: 'int' })
  room_id: number;

  // --- RELATION ---
  @ManyToOne(() => OrgRoom, { nullable: false })
  @JoinColumn({ name: 'room_id', referencedColumnName: 'room_id' })
  room: OrgRoom;

  // --- COLUMNS ---
  @Column({
    name: 'ticket_type',
    type: 'enum',
    enum: CounterTicketType,
  })
  ticket_type: CounterTicketType;

  @Column({ name: 'last_number', type: 'int', default: 0 })
  last_number: number;

  @Column({ name: 'reset_date', type: 'date', default: () => 'CURRENT_DATE' })
  reset_date: Date;
}