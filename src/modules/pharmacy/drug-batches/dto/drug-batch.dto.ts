import {
  IsBoolean,
  IsInt,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PageQueryDto } from 'src/modules/_shared/pagination';

export class UpdateDrugBatchDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  location_id?: number | null;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  is_opened_box?: boolean;
}

export class QueryDrugBatchDto extends PageQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  drug_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  location_id?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  has_stock?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  is_expired?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  expiring_in_days?: number;
}

