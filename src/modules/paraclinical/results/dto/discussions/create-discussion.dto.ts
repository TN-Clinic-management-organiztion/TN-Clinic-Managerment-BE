import { IsUUID, IsString, IsOptional } from 'class-validator';

export class CreateDiscussionDto {
  @IsUUID()
  result_id: string;

  @IsUUID()
  sender_id: string;

  @IsString()
  message_content: string;

  @IsOptional()
  @IsUUID()
  parent_id?: string;
}