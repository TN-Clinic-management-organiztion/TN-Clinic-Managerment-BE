import { PageQueryDto } from 'src/modules/_shared/pagination';
import {
  IsUUID,
  IsNotEmpty,
  IsString,
  IsInt,
  IsOptional,
  IsDateString,
  IsBoolean,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

export class CreateSalaryConfigDto {
  @IsNotEmpty()
  @IsUUID()
  staff_id: string;

  @IsNotEmpty()
  @IsString()
  base_salary: string; // Numeric as string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  standard_days_per_month?: number;

  @IsNotEmpty()
  @IsDateString()
  effective_date: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;
}

export class UpdateSalaryConfigDto extends PartialType(CreateSalaryConfigDto) {}

export class QuerySalaryConfigDto extends PageQueryDto {
  @IsOptional()
  @IsUUID()
  staff_id?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  active_only?: boolean;
}