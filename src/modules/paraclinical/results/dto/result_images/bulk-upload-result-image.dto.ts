import { ArrayMinSize, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateResultImageDto } from './create-result-image.dto';

export class BulkUploadResultImagesDto {
  @ApiProperty({
    description: 'Danh sách ảnh cần upload',
    type: [CreateResultImageDto]
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateResultImageDto)
  images: CreateResultImageDto[];
}