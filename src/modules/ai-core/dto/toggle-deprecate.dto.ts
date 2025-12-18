import { IsBoolean, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class ToggleDeprecateDto {
  @IsBoolean()
  @IsNotEmpty()
  is_deprecated: boolean;

  @IsString()
  @IsOptional()
  reason?: string; // Lý do deprecate (optional)
}