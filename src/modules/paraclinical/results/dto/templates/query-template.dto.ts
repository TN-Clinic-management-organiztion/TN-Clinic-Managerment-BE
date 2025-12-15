import { IsOptional, IsInt, IsUUID, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { PageQueryDto } from 'src/modules/_shared/pagination';

export class QueryTemplateDto extends PageQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  service_id?: number;

  @IsOptional()
  @IsUUID()
  created_by?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  is_default?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  is_public?: boolean;
}