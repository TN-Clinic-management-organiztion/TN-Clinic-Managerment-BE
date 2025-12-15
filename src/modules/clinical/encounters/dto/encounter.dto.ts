import { PageQueryDto } from 'src/modules/_shared/pagination';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
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
  @IsUUID()
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