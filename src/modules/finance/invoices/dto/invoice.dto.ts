import { PageQueryDto } from 'src/modules/_shared/pagination';
import {
  IsUUID,
  IsOptional,
  IsEnum,
  IsString,
  IsInt,
  IsDateString,
  IsNotEmpty,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';
// Import enum từ entities
import { InvoiceStatus } from 'src/database/entities/finance/invoices.entity';
import { InvoiceItemType } from 'src/database/entities/finance/invoice_items.entity';

export class CreateInvoiceDto {
  @IsOptional()
  @IsUUID()
  encounter_id?: string;

  @IsNotEmpty()
  @IsUUID()
  cashier_id: string;
}

export class UpdateInvoiceDto extends PartialType(CreateInvoiceDto) {
  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;
}

export class QueryInvoiceDto extends PageQueryDto {
  @IsOptional()
  @IsUUID()
  encounter_id?: string;

  @IsOptional()
  @IsUUID()
  cashier_id?: string;

  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  @IsOptional()
  @IsDateString()
  from_date?: string;

  @IsOptional()
  @IsDateString()
  to_date?: string;
}

export class AddInvoiceItemDto {
  @IsNotEmpty()
  @IsEnum(InvoiceItemType)
  item_type: InvoiceItemType;

  @IsOptional()
  @IsUUID()
  service_item_id?: string;

  @IsOptional()
  @IsUUID()
  prescription_detail_id?: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;

  @IsNotEmpty()
  @IsString()
  unit_price: string; // Numeric as string
}