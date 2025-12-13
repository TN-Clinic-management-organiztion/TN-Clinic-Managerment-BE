import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateIcd10Dto {
  @IsNotEmpty({ message: 'Mã ICD không được để trống' })
  @IsString()
  @MaxLength(10)
  icd_code: string; // PK phải tự nhập

  @IsNotEmpty({ message: 'Tên tiếng Việt không được để trống' })
  @IsString()
  @MaxLength(500)
  name_vi: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  name_en?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  parent_code?: string; // Chỉ cần gửi mã cha (FK)

  @IsOptional()
  @IsInt()
  level?: number;

  @IsOptional()
  @IsBoolean()
  is_leaf?: boolean;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}