import { IsNotEmpty, IsString, IsOptional, Matches } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateShiftDto {
  @IsOptional()
  @IsString()
  shift_name?: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'start_time must be in HH:MM format',
  })
  start_time: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'end_time must be in HH:MM format',
  })
  end_time: string;

  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'break_start must be in HH:MM format',
  })
  break_start?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'break_end must be in HH:MM format',
  })
  break_end?: string;

  @IsOptional()
  @IsString()
  work_day_credit?: string; // Numeric as string, default 1.0
}

export class UpdateShiftDto extends PartialType(CreateShiftDto) {}