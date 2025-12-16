import {
  IsInt,
  IsNotEmpty,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class DispensePrescriptionDto {
  @IsNotEmpty()
  @IsUUID()
  prescription_id: string;

  @IsNotEmpty()
  @IsUUID()
  dispensing_pharmacist_id: string;
}

export class ManualDispenseDto {
  @IsNotEmpty()
  @IsUUID()
  detail_id: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  batch_id: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;
}