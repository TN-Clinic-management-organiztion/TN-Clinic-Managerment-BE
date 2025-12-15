import { IsOptional, IsUUID } from 'class-validator';
import { PageQueryDto } from 'src/modules/_shared/pagination';

export class QueryDiscussionDto extends PageQueryDto {
  @IsOptional()
  @IsUUID()
  result_id?: string;

  @IsOptional()
  @IsUUID()
  sender_id?: string;
}