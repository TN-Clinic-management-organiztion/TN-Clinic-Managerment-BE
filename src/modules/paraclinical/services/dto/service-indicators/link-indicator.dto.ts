import { IsInt, IsOptional } from 'class-validator';

export class LinkServiceIndicatorDto {
  @IsInt()
  service_id: number;

  @IsInt()
  indicator_id: number;

  @IsOptional()
  @IsInt()
  sort_order?: number;
}