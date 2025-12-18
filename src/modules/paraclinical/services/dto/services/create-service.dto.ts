import { IsInt, IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';
import { ResultInputType } from 'src/database/entities/service/ref_services.entity';

export class CreateServiceDto {
  @IsOptional()
  @IsInt()
  category_id?: number;

  @IsString()
  service_name: string;

  @IsOptional()
  @IsNumber()
  unit_price?: number;

  @IsOptional()
  @IsEnum(ResultInputType)
  result_input_type?: ResultInputType;
}