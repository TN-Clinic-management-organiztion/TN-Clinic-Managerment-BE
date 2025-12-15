import { PrescriptionStatus } from './../../../../database/entities/pharmacy/prescriptions.entity';
import { PageQueryDto } from 'src/modules/_shared/pagination';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// export enum PrescriptionStatus {
//   DRAFT = 'DRAFT',
//   ISSUED = 'ISSUED',
//   DISPENSED = 'DISPENSED',
//   CANCELLED = 'CANCELLED',
// }

export class CreatePrescriptionDetailDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  drug_id: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsString()
  usage_note?: string;
}

export class CreatePrescriptionDto {
  @IsOptional()
  @IsUUID()
  encounter_id?: string | null;

  @IsOptional()
  @IsUUID()
  prescribing_doctor_id?: string | null;

  @IsOptional()
  @IsString()
  interaction_override_reason?: string;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePrescriptionDetailDto)
  details: CreatePrescriptionDetailDto[];
}

export class UpdatePrescriptionDto {
  @IsOptional()
  @IsUUID()
  encounter_id?: string | null;

  @IsOptional()
  @IsUUID()
  prescribing_doctor_id?: string | null;

  @IsOptional()
  @IsString()
  interaction_override_reason?: string;

  @IsOptional()
  @IsEnum(PrescriptionStatus)
  status?: PrescriptionStatus;
}

export class IssuePrescriptionDto {
  @IsNotEmpty()
  @IsUUID()
  prescribing_doctor_id: string;
}

export class QueryPrescriptionDto extends PageQueryDto {
  @IsOptional()
  @IsUUID()
  encounter_id?: string;

  @IsOptional()
  @IsUUID()
  prescribing_doctor_id?: string;

  @IsOptional()
  @IsEnum(PrescriptionStatus)
  status?: PrescriptionStatus;
}