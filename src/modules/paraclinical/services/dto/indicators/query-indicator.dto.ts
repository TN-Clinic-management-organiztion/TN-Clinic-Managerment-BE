import { IsOptional, IsString } from 'class-validator';
import { PageQueryDto } from 'src/modules/_shared/pagination';

export class QueryIndicatorDto extends PageQueryDto {
  @IsOptional()
  @IsString()
  indicator_code?: string;
}