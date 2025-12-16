import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { StaffProfile } from '../auth/staff_profiles.entity';

export enum NotificationType { SYSTEM = 'SYSTEM', APPOINTMENT = 'APPOINTMENT', URGENT = 'URGENT', LEAVE = 'LEAVE', PAYROLL = 'PAYROLL', TASK = 'TASK' }

@Entity('system_notifications')
export class SystemNotification {
  @PrimaryGeneratedColumn('uuid', { name: 'notification_id' })
  notification_id: string;

  // --- RAW FKs ---
  @Column({ name: 'user_id', type: 'uuid' })
  user_id: string;

  @Column({ name: 'sender_id', type: 'uuid', nullable: true })
  sender_id?: string | null;

  // --- RELATIONS ---
  @ManyToOne(() => StaffProfile, { nullable: false })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'staff_id' })
  user: StaffProfile;

  @ManyToOne(() => StaffProfile, { nullable: true })
  @JoinColumn({ name: 'sender_id', referencedColumnName: 'staff_id' })
  sender?: StaffProfile;

  // --- COLUMNS ---
  @Column({ name: 'title', length: 200 })
  title: string;

  @Column({ name: 'message', type: 'text' })
  message: string;

  @Column({ name: 'notification_type', type: 'enum', enum: NotificationType, default: NotificationType.SYSTEM })
  notification_type: NotificationType;

  @Column({ name: 'is_read', default: false })
  is_read: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date;
}