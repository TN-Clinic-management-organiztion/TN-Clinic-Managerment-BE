import { PageQueryDto } from 'src/modules/_shared/pagination';
import {
  IsUUID,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsUUID()
  invoice_id: string;

  @IsNotEmpty()
  @IsString()
  payment_method_code: string;

  @IsNotEmpty()
  @IsString()
  amount: string; // Numeric as string

  @IsOptional()
  @IsString()
  transaction_ref?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class QueryPaymentDto extends PageQueryDto {
  @IsOptional()
  @IsUUID()
  invoice_id?: string;

  @IsOptional()
  @IsString()
  payment_method_code?: string;

  @IsOptional()
  @IsDateString()
  from_date?: string;

  @IsOptional()
  @IsDateString()
  to_date?: string;
}