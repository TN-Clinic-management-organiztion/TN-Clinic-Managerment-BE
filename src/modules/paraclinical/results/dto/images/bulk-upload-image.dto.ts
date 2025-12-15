import { ArrayMinSize, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateResultImageDto } from 'src/modules/paraclinical/results/dto/images/create-image.dto';

export class BulkUploadImagesDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateResultImageDto)
  images: CreateResultImageDto[];
}