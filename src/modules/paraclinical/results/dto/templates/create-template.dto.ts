import { IsInt, IsString, IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class CreateTemplateDto {
  @IsInt()
  service_id: number;

  @IsUUID()
  created_by: string;

  @IsString()
  template_name: string;

  @IsString()
  body_html: string;

  @IsOptional()
  @IsBoolean()
  is_default?: boolean;

  @IsOptional()
  @IsBoolean()
  is_public?: boolean;
}