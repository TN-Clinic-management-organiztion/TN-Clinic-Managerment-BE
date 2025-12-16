import { PageQueryDto } from 'src/modules/_shared/pagination';
import {
  IsUUID,
  IsNotEmpty,
  IsEnum,
  IsInt,
  IsOptional,
  IsDateString,
  IsString,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
// Import enum từ entities
import { AttendanceStatus } from 'src/database/entities/hr/hr_time_attendance.entity';

export class CheckInDto {
  @IsNotEmpty()
  @IsUUID()
  staff_id: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  shift_id?: number;

  @IsOptional()
  @IsString()
  ip_address?: string;
}

export class CheckOutDto {
  @IsNotEmpty()
  @IsUUID()
  staff_id: string;

  @IsOptional()
  @IsString()
  ip_address?: string;
}

export class QueryAttendanceDto extends PageQueryDto {
  @IsOptional()
  @IsUUID()
  staff_id?: string;

  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  shift_id?: number;

  @IsOptional()
  @IsDateString()
  from_date?: string;

  @IsOptional()
  @IsDateString()
  to_date?: string;
}

export class UpdateAttendanceDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  shift_id?: number;

  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;

  @IsOptional()
  @IsString()
  actual_hours?: string;

  @IsOptional()
  @IsBoolean()
  is_late?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  late_minutes?: number;

  @IsOptional()
  @IsBoolean()
  is_early_leave?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  early_leave_minutes?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  overtime_minutes?: number;

  @IsOptional()
  @IsString()
  admin_notes?: string;

  @IsOptional()
  @IsUUID()
  leave_request_id?: string;
}