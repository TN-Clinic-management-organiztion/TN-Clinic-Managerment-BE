import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { OrgRoom } from '../auth/org_rooms.entity';
import { RefService } from './ref_services.entity';

@Entity('room_services')
export class RoomService {
  // --- KEYS (Raw IDs) ---
  @PrimaryColumn({ name: 'room_id' })
  room_id: number;

  @PrimaryColumn({ name: 'service_id' })
  service_id: number;

  // --- RELATIONS ---
  @ManyToOne(() => OrgRoom)
  @JoinColumn({ name: 'room_id', referencedColumnName: 'room_id' })
  room: OrgRoom;

  @ManyToOne(() => RefService)
  @JoinColumn({ name: 'service_id', referencedColumnName: 'service_id' })
  service: RefService;
}