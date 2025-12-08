import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum RoomType {
  CLINIC = 'CLINIC',
  IMAGING = 'IMAGING',
  LAB = 'LAB',
  PHARMACY = 'PHARMACY',
  CASHIER = 'CASHIER',
  ADMIN = 'ADMIN',
}

@Entity('org_rooms')
export class OrgRoom {
  @PrimaryGeneratedColumn({ name: 'room_id' })
  roomId: number;

  @Column({name: 'room_name', length: 100})
  roomName: string;

  @Column({name: 'room_type', type: 'enum', enum: RoomType, nullable: true})
  roomType: RoomType;

  @Column({name: 'is_active', default: true})
  isActive: boolean;
}