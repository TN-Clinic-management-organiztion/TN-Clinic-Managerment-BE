import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, IsUUID } from "class-validator";

export class CreateResultImageDto {
  @IsUUID()
  @IsOptional()
  result_id?: string;

  @IsString()
  @IsOptional()
  public_id?: string;

  @IsUrl()
  @IsNotEmpty()
  original_image_url: string;

  @IsString()
  @IsNotEmpty()
  file_name: string;

  @IsNumber()
  @IsNotEmpty()
  file_size: number;

  @IsString()
  @IsNotEmpty()
  mime_type: string;

  @IsUUID()
  @IsNotEmpty()
  uploaded_by: string;
}