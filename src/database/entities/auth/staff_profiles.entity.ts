import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { SysUser } from './sys_users.entity';
import { SysRole } from './sys_roles.entity';
import { OrgRoom } from './org_rooms.entity';
import { RefSpecialty } from './ref_specialties.entity';

@Entity('staff_profiles')
export class StaffProfile {
  // PK + FK -> sys_users(user_id)
  @PrimaryColumn('uuid', { name: 'staff_id' })
  staffId: string;

  @Column({ name: 'full_name', length: 255 })
  fullName: string;

  @Column({ name: 'signature_url', length: 500, nullable: true })
  signatureUrl?: string;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date;

  // ====== PK ======

  // staff_id -> sys_users.user_id
  @OneToOne(() => SysUser)
  @JoinColumn({ name: 'staff_id', referencedColumnName: 'userId' })
  user: SysUser;

  // role_id -> sys_roles.role_id
  @ManyToOne(() => SysRole, { nullable: false })
  @JoinColumn({ name: 'role_id', referencedColumnName: 'roleId' })
  roleId: SysRole;

  // assigned_room_id -> org_rooms.room_id
  @ManyToOne(() => OrgRoom, { nullable: true })
  @JoinColumn({ name: 'assigned_room_id', referencedColumnName: 'roomId' })
  assignedRoomId?: OrgRoom;

  // specialty_id -> ref_specialties.specialty_id
  @ManyToOne(() => RefSpecialty, { nullable: true })
  @JoinColumn({ name: 'specialty_id', referencedColumnName: 'specialtyId' })
  specialtyId?: RefSpecialty;
}
