import { IsString } from 'class-validator';

export class UpdateDiscussionDto {
  @IsString()
  message_content: string;
}