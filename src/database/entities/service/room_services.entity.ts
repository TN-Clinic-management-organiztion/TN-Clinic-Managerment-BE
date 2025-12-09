import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { OrgRoom } from '../auth/org_rooms.entity';
import { RefService } from './ref_services.entity';

@Entity('room_services')
export class RoomService {
  @PrimaryColumn({ name: 'room_id' })
  roomId: number;

  @PrimaryColumn({ name: 'service_id' })
  serviceId: number;

  @ManyToOne(() => OrgRoom)
  @JoinColumn({ name: 'room_id', referencedColumnName: 'roomId' })
  room: OrgRoom;

  @ManyToOne(() => RefService)
  @JoinColumn({ name: 'service_id', referencedColumnName: 'serviceId' })
  service: RefService;
}