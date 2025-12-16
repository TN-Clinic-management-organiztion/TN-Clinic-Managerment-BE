import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { PaymentStatus } from 'src/database/entities/service/service_requests.entity';
import { CreateServiceRequestDto } from './create-service-request.dto';

export class UpdateServiceRequestDto extends PartialType(
  CreateServiceRequestDto,
) {
  @IsOptional()
  @IsEnum(PaymentStatus)
  payment_status?: PaymentStatus;
}