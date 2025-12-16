import { IsEnum } from 'class-validator';
import { ServiceItemStatus } from 'src/database/entities/service/service_request_items.entity';

export class UpdateRequestItemDto {
  @IsEnum(ServiceItemStatus)
  status: ServiceItemStatus;
}