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
  discussionId: string;

  @ManyToOne(() => ServiceResult, { nullable: false })
  @JoinColumn({ name: 'result_id', referencedColumnName: 'resultId' })
  resultId: ServiceResult;

  @ManyToOne(() => StaffProfile, { nullable: false })
  @JoinColumn({ name: 'sender_id', referencedColumnName: 'staffId' })
  senderId: StaffProfile;

  @Column({ name: 'message_content', type: 'text' })
  messageContent: string;

  @ManyToOne(() => ResultDiscussion, { nullable: true })
  @JoinColumn({
    name: 'parent_id',
    referencedColumnName: 'discussionId',
  })
  parentId?: ResultDiscussion;

  @Column({ name: 'lft', type: 'int' })
  lft: number;

  @Column({ name: 'rgt', type: 'int' })
  rgt: number;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt: Date;
}
