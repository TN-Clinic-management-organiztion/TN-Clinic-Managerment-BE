import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { PageQueryDto } from "src/modules/_shared/pagination";
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';

export class CreateSupplierDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  supplier_name: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  contact_person?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  is_active?: boolean = true;
}

export class UpdateSupplierDto extends PartialType(CreateSupplierDto) {}

export class QuerySupplierDto extends PageQueryDto {
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  is_active?: boolean;
}