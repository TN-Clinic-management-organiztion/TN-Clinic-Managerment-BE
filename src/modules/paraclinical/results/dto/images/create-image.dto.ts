import { IsNotEmpty, IsNumber, isNumber, IsOptional, IsString, IsUrl, IsUUID } from 'class-validator';

export class CreateResultImageDto {
  @IsOptional()
  @IsUUID()
  result_id?: string;

  @IsOptional()
  @IsString()
  public_id?: string;

  @IsOptional()
  @IsUrl()
  original_image_url?: string;

  @IsOptional()
  @IsString()
  file_name?: string;

  @IsOptional()
  @IsString()
  file_size?: string;

  @IsOptional()
  @IsString()
  mime_type?: string;

  @IsNotEmpty()
  @IsNumber()
  image_width: number;

  @IsNotEmpty()
  @IsNumber()
  image_height: number;

  @IsNotEmpty()
  @IsUUID()
  uploaded_by: string;
}