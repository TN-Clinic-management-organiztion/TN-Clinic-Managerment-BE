import { IsNotEmpty, IsString, IsBoolean, IsOptional, MaxLength } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreatePaymentMethodDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  payment_method_code: string; // 'CASH', 'BANK', 'CARD', 'MOMO', etc.

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  method_name: string; // 'Tiền mặt', 'Chuyển khoản', etc.

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdatePaymentMethodDto extends PartialType(CreatePaymentMethodDto) {}