import { PageQueryDto } from 'src/modules/_shared/pagination';
import {
  IsUUID,
  IsNotEmpty,
  IsEnum,
  IsDateString,
  IsString,
  IsOptional,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
// Import enum từ entities
import {
  LeaveType,
  LeaveRequestStatus,
} from 'src/database/entities/hr/hr_leave_requests.entity';

export class CreateLeaveDto {
  @IsNotEmpty()
  @IsUUID()
  staff_id: string;

  @IsNotEmpty()
  @IsEnum(LeaveType)
  leave_type: LeaveType;

  @IsNotEmpty()
  @IsDateString()
  start_date: string;

  @IsNotEmpty()
  @IsDateString()
  end_date: string;

  @IsNotEmpty()
  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  contact_info?: string;
}

export class UpdateLeaveDto extends PartialType(CreateLeaveDto) {}

export class QueryLeaveDto extends PageQueryDto {
  @IsOptional()
  @IsUUID()
  staff_id?: string;

  @IsOptional()
  @IsEnum(LeaveRequestStatus)
  status?: LeaveRequestStatus;

  @IsOptional()
  @IsEnum(LeaveType)
  leave_type?: LeaveType;

  @IsOptional()
  @IsDateString()
  from_date?: string;

  @IsOptional()
  @IsDateString()
  to_date?: string;
}

export class ApproveLeaveDto {
  @IsNotEmpty()
  @IsEnum(LeaveRequestStatus)
  status: LeaveRequestStatus; // APPROVED or REJECTED

  @IsNotEmpty()
  @IsUUID()
  approver_id: string;
}