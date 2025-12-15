import { Type } from "class-transformer";
import { IsInt, IsOptional } from "class-validator";
import { PageQueryDto } from "src/modules/_shared/pagination";

export class QueryDrugCategoryDto extends PageQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  parent_id?: number | null;
}