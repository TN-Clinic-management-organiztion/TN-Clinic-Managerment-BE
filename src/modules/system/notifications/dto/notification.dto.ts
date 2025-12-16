import { PageQueryDto } from 'src/modules/_shared/pagination';
import {
  IsUUID,
  IsNotEmpty,
  IsString,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsArray,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
// Import enum từ entities
import { NotificationType } from 'src/database/entities/system/system_notifications.entity';

export class CreateNotificationDto {
  @IsNotEmpty()
  @IsUUID()
  user_id: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  title: string;

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsOptional()
  @IsEnum(NotificationType)
  notification_type?: NotificationType;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  is_important?: boolean;

  @IsOptional()
  @IsUUID()
  sender_id?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  sender_name?: string;
}

export class QueryNotificationDto extends PageQueryDto {
  @IsOptional()
  @IsUUID()
  user_id?: string;

  @IsOptional()
  @IsEnum(NotificationType)
  notification_type?: NotificationType;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  is_read?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  is_important?: boolean;
}

export class MarkAsReadDto {
  @IsNotEmpty()
  @IsUUID()
  user_id: string;

  @IsNotEmpty()
  @IsArray()
  @IsUUID('4', { each: true })
  notification_ids: string[];
}