import { PageQueryDto } from 'src/modules/_shared/pagination';
import {
  IsUUID,
  IsNotEmpty,
  IsEnum,
  IsString,
  IsInt,
  IsOptional,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';
// Import enum từ entities
import { PayrollStatus } from 'src/database/entities/hr/hr_payroll.entity';

export class CreatePayrollDto {
  @IsNotEmpty()
  @IsUUID()
  staff_id: string;

  @IsNotEmpty()
  @IsDateString()
  payroll_month: string; // Format: YYYY-MM-01

  @IsNotEmpty()
  @IsString()
  work_days: string;

  @IsNotEmpty()
  @IsString()
  leave_days: string;

  @IsNotEmpty()
  @IsString()
  total_paid_days: string;

  @IsNotEmpty()
  @IsString()
  overtime_hours: string;

  @IsNotEmpty()
  @IsString()
  base_salary: string;

  @IsNotEmpty()
  @IsString()
  actual_salary: string;

  @IsNotEmpty()
  @IsString()
  overtime_salary: string;

  @IsNotEmpty()
  @IsString()
  total_allowances: string;

  @IsOptional()
  @IsString()
  total_bonus?: string;

  @IsOptional()
  @IsString()
  total_penalty?: string;

  @IsNotEmpty()
  @IsString()
  net_salary: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdatePayrollDto extends PartialType(CreatePayrollDto) {
  @IsOptional()
  @IsEnum(PayrollStatus)
  status?: PayrollStatus;

  @IsOptional()
  @IsUUID()
  approved_by?: string;
}

export class QueryPayrollDto extends PageQueryDto {
  @IsOptional()
  @IsUUID()
  staff_id?: string;

  @IsOptional()
  @IsEnum(PayrollStatus)
  status?: PayrollStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;
}

export class CalculatePayrollDto {
  @IsNotEmpty()
  @IsUUID()
  staff_id: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  year: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;
}