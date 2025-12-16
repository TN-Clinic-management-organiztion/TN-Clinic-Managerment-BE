import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ServiceResult } from './service_results.entity';
import { StaffProfile } from '../auth/staff_profiles.entity';

@Entity('result_discussions')
export class ResultDiscussion {
  @PrimaryGeneratedColumn('uuid', { name: 'discussion_id' })
  discussion_id: string;

  // --- RAW FKs ---
  @Column({ name: 'result_id', type: 'uuid' })
  result_id: string;

  @Column({ name: 'sender_id', type: 'uuid' })
  sender_id: string;

  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parent_id?: string | null;

  // --- RELATIONS ---
  @ManyToOne(() => ServiceResult, { nullable: false })
  @JoinColumn({ name: 'result_id', referencedColumnName: 'result_id' })
  result: ServiceResult;

  @ManyToOne(() => StaffProfile, { nullable: false })
  @JoinColumn({ name: 'sender_id', referencedColumnName: 'staff_id' })
  sender: StaffProfile;

  @ManyToOne(() => ResultDiscussion, { nullable: true })
  @JoinColumn({ name: 'parent_id', referencedColumnName: 'discussion_id' })
  parent?: ResultDiscussion;

  // --- COLUMNS ---
  @Column({ name: 'message_content', type: 'text' })
  message_content: string;

  @Column({ name: 'lft', type: 'int' })
  lft: number;

  @Column({ name: 'rgt', type: 'int' })
  rgt: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date;
}