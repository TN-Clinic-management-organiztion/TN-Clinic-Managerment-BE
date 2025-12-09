import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { StaffProfile } from '../auth/staff_profiles.entity';

export enum NotificationType {
  SYSTEM = 'SYSTEM',
  APPOINTMENT = 'APPOINTMENT',
  URGENT = 'URGENT',
  LEAVE = 'LEAVE',
  PAYROLL = 'PAYROLL',
  TASK = 'TASK',
}

@Entity('system_notifications')
export class SystemNotification {
  @PrimaryGeneratedColumn('uuid', { name: 'notification_id' })
  notificationId: string;

  @ManyToOne(() => StaffProfile, { nullable: false })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'staffId' })
  userId: StaffProfile;

  @Column({ name: 'title', length: 200 })
  title: string;

  @Column({ name: 'message', type: 'text' })
  message: string;

  @Column({
    name: 'notification_type',
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.SYSTEM,
  })
  notificationType: NotificationType;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @Column({ name: 'is_important', default: false })
  isImportant: boolean;

  @ManyToOne(() => StaffProfile, { nullable: true })
  @JoinColumn({ name: 'sender_id', referencedColumnName: 'staffId' })
  senderId?: StaffProfile;

  @Column({ name: 'sender_name', length: 100, default: 'Hệ thống' })
  senderName: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt: Date;

  @Column({
    name: 'read_at',
    type: 'timestamptz',
    nullable: true,
  })
  readAt?: Date;

  @Column({ name: 'is_deleted', default: false })
  isDeleted: boolean;
}
