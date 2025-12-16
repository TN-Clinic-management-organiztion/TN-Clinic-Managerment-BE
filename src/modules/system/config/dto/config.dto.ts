import { PageQueryDto } from 'src/modules/_shared/pagination';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateConfigDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  config_key: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  config_value: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  config_type?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  updated_by?: string;
}

export class UpdateConfigDto extends PartialType(CreateConfigDto) {}

export class QueryConfigDto extends PageQueryDto {
  @IsOptional()
  @IsString()
  config_type?: string;
}