import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { PageQueryDto } from 'src/modules/_shared/pagination';

export class CreateDrugDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  category_id?: number | null;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  drug_name: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  active_ingredient?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  drug_code?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  dosage_form?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  route?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  strength?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  unit_name?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  reorder_level?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  is_active?: boolean = true;
}

export class UpdateDrugDto extends PartialType(CreateDrugDto) {}

export class QueryDrugDto extends PageQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  category_id?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  is_active?: boolean;

  @IsOptional()
  @IsString()
  dosage_form?: string;

  @IsOptional()
  @IsString()
  route?: string;
}