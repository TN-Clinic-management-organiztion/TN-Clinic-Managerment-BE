import { PageQueryDto } from 'src/modules/_shared/pagination';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

export enum EncounterStatus {
  REGISTERED = 'REGISTERED',
  AWAITING_PAYMENT = 'AWAITING_PAYMENT',
  IN_CONSULTATION = 'IN_CONSULTATION',
  AWAITING_CLS = 'AWAITING_CLS',
  IN_CLS = 'IN_CLS',
  CLS_COMPLETED = 'CLS_COMPLETED',
  RESULTS_READY = 'RESULTS_READY',
  COMPLETED = 'COMPLETED',
}

export class CreateEncounterDto {
  @IsNotEmpty()
  @IsUUID('all')
  patient_id: string;

  @IsOptional()
  @IsUUID()
  doctor_id?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  assigned_room_id?: number | null;

  @IsOptional()
  @IsString()
  initial_symptoms?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  weight?: number; // Cân nặng (kg)

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  height?: number; // Chiều cao (cm)

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  bmi?: number; // BMI (Có thể gửi từ FE hoặc để BE tự tính)

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  temperature?: number; // Nhiệt độ

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  pulse?: number; // Mạch

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  respiratory_rate?: number; // Nhịp thở

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  bp_systolic?: number; // Huyết áp tâm thu

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  bp_diastolic?: number; // Huyết áp tâm trương

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  sp_o2?: number; // SpO2
}

export class UpdateEncounterDto extends PartialType(CreateEncounterDto) {
  @IsOptional()
  @IsEnum(EncounterStatus)
  current_status?: EncounterStatus;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  final_icd_code?: string | null;

  @IsOptional()
  @IsString()
  doctor_conclusion?: string;
}

export class QueryEncounterDto extends PageQueryDto {
  @IsOptional()
  @IsUUID()
  patient_id?: string;

  @IsOptional()
  @IsUUID()
  doctor_id?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  assigned_room_id?: number;

  @IsOptional()
  @IsEnum(EncounterStatus)
  current_status?: EncounterStatus;
}

export class StartConsultationDto {
  @IsNotEmpty()
  @IsUUID()
  doctor_id: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  assigned_room_id?: number;
}

export class CompleteConsultationDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(10)
  final_icd_code: string;

  @IsNotEmpty()
  @IsString()
  doctor_conclusion: string;
}