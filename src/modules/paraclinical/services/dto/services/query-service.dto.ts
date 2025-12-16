import { IsOptional, IsInt, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { PageQueryDto } from 'src/modules/_shared/pagination';
import { ResultInputType } from 'src/database/entities/service/ref_services.entity';

export class QueryServiceDto extends PageQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  category_id?: number;

  @IsOptional()
  @IsEnum(ResultInputType)
  result_input_type?: ResultInputType;
}