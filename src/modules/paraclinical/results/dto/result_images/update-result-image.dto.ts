import { PartialType } from '@nestjs/mapped-types';
import { IsOptional } from 'class-validator';
import { CreateResultImageDto } from './create-result-image.dto'; // Hãy chắc chắn đường dẫn import đúng

export class UpdateResultImageDto extends PartialType(CreateResultImageDto) {
  @IsOptional()
  original_image_url: string;

  @IsOptional()
  public_id: string;
}