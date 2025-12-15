import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDrugCategoryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  parent_id?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  category_code?: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  category_name: string;
}