import { PageQueryDto } from 'src/modules/_shared/pagination';
import {
  IsUUID,
  IsString,
  IsOptional,
  IsDateString,
  MaxLength,
} from 'class-validator';

export class CreateAuditLogDto {
  @IsOptional()
  @IsUUID()
  user_id?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  action_type?: string; // CREATE, UPDATE, DELETE, LOGIN, LOGOUT, etc.

  @IsOptional()
  @IsString()
  @MaxLength(50)
  table_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  record_id?: string;

  @IsOptional()
  old_value?: any; // JSONB

  @IsOptional()
  new_value?: any; // JSONB

  @IsOptional()
  @IsString()
  ip_address?: string;
}

export class QueryAuditLogDto extends PageQueryDto {
  @IsOptional()
  @IsUUID()
  user_id?: string;

  @IsOptional()
  @IsString()
  action_type?: string;

  @IsOptional()
  @IsString()
  table_name?: string;

  @IsOptional()
  @IsDateString()
  from_date?: string;

  @IsOptional()
  @IsDateString()
  to_date?: string;
}