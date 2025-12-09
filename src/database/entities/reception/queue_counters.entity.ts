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
  counterId: number;

  @ManyToOne(() => OrgRoom, { nullable: false })
  @JoinColumn({ name: 'room_id', referencedColumnName: 'roomId' })
  roomId: OrgRoom;

  @Column({
    name: 'ticket_type',
    type: 'enum',
    enum: CounterTicketType,
  })
  ticketType: CounterTicketType;

  @Column({ name: 'last_number', type: 'int', default: 0 })
  lastNumber: number;

  @Column({ name: 'reset_date', type: 'date', default: () => 'CURRENT_DATE' })
  resetDate: Date;
}
