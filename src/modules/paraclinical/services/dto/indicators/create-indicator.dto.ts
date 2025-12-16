import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateIndicatorDto {
  @IsOptional()
  @IsString()
  indicator_code?: string;

  @IsOptional()
  @IsString()
  indicator_name?: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsNumber()
  ref_min_male?: number;

  @IsOptional()
  @IsNumber()
  ref_max_male?: number;

  @IsOptional()
  @IsNumber()
  ref_min_female?: number;

  @IsOptional()
  @IsNumber()
  ref_max_female?: number;
}