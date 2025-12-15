import { IsNotEmpty, IsOptional, IsString, IsUrl, IsUUID } from 'class-validator';

export class CreateResultImageDto {
  @IsOptional()
  @IsUUID()
  result_id?: string;

  @IsOptional()
  @IsString()
  public_id?: string;

  @IsNotEmpty()
  @IsUrl()
  original_image_url: string;

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
  @IsUUID()
  uploaded_by: string;
}