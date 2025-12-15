import { PageQueryDto } from '../../../_shared/pagination';
import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateInventoryLocationDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^[A-Za-z0-9_]+(\.[A-Za-z0-9_]+)*$/, {
    message: 'Path must be valid ltree format (e.g., PHARMACY.ROOM1.SHELF3)',
  })
  path: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  location_name?: string;
}

export class UpdateInventoryLocationDto extends PartialType(CreateInventoryLocationDto) {}

export class QueryInventoryLocationDto extends PageQueryDto {
  @IsOptional()
  @IsString()
  parent_path?: string; // Lọc theo đường dẫn cha
}