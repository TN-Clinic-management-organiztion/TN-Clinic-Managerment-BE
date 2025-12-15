import { DrugInteractionSeverity } from './../../database/entities/pharmacy/drug_interactions.entity';
import { PageQueryDto } from './../_shared/pagination';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

export class CreateDrugInteractionDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  drug_a_id: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  drug_b_id: number;

  @IsOptional()
  @IsEnum(DrugInteractionSeverity)
  severity?: DrugInteractionSeverity;

  @IsOptional()
  @IsString()
  warning_message?: string;
}

export class UpdateDrugInteractionDto extends PartialType(CreateDrugInteractionDto) {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  drug_a_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  drug_b_id?: number;
}

export class QueryDrugInteractionDto extends PageQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  drug_id?: number; // Tìm tất cả tương tác của 1 thuốc

  @IsOptional()
  @IsEnum(DrugInteractionSeverity)
  severity?: DrugInteractionSeverity;
}