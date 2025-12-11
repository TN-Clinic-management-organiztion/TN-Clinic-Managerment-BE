import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, IsUUID } from "class-validator";

export class CreateResultImageDto {
  @IsUUID()
  @IsOptional()
  result_id?: string;

  @IsString()
  @IsOptional()
  public_id?: string;

  @IsUrl()
  @IsOptional()
  original_image_url?: string;

  @IsString()
  @IsOptional()
  file_name?: string;

  @IsString()
  @IsOptional()
  file_size?: string;

  @IsString()
  @IsOptional()
  mime_type?: string;

  @IsUUID()
  @IsNotEmpty()
  uploaded_by: string;
}