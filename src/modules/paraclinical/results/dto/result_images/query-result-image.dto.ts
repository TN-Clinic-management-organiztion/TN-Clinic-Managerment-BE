import { Type } from "class-transformer";
import { IsDateString, IsInt, IsOptional, IsString, IsUUID, Max, Min } from "class-validator";

export class QueryResultImageDto {
  @IsUUID()
  @IsOptional()
  result_id?: string;

  @IsUUID()
  @IsOptional()
  uploaded_by?: string;

  @IsString()
  @IsOptional()
  mime_type?: string;

  @IsDateString()
  @IsOptional()
  uploaded_from?: string;

  @IsDateString()
  @IsOptional()
  uploaded_to?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;

  @IsString()
  @IsOptional()
  sort_by?: string = 'uploaded_at';

  @IsString()
  @IsOptional()
  order?: 'ASC' | 'DESC' = 'DESC';
}