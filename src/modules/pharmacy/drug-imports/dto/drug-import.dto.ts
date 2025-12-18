import {
  IsArray,
  IsDateString,
  IsDecimal,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PageQueryDto } from 'src/modules/_shared/pagination';

export class CreateDrugImportDetailDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  drug_id: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;

  @IsNotEmpty()
  @IsString()
  @IsDecimal({ decimal_digits: '0,2' })
  unit_price: string;
}

export class CreateDrugImportDto {
  @IsOptional()
  @IsDateString()
  import_date?: string;

  @IsOptional()
  @IsUUID()
  imported_by?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  invoice_number?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDrugImportDetailDto)
  details: CreateDrugImportDetailDto[];
}

export class UpdateDrugImportDto {
  @IsOptional()
  @IsDateString()
  import_date?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  invoice_number?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class QueryDrugImportDto extends PageQueryDto {
  @IsOptional()
  @IsDateString()
  from_date?: string;

  @IsOptional()
  @IsDateString()
  to_date?: string;
}