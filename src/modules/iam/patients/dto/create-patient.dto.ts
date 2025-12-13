import { IsNotEmpty, IsString, IsOptional, IsDateString, IsEnum, MaxLength, MinLength } from 'class-validator';

export enum Gender {
  NAM = 'NAM',
  NU = 'NU',
  KHAC = 'KHAC'
}

export class CreatePatientDto {
  @IsOptional()
  @IsString()
  @MaxLength(12)
  cccd?: string; // OPTIONAL: Không bắt buộc, có thể để trống

  @IsNotEmpty()
  @IsString()
  full_name: string;

  @IsNotEmpty()
  @IsDateString()
  dob: string; // Format: YYYY-MM-DD

  @IsNotEmpty()
  @IsEnum(Gender)
  gender: Gender;

  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  phone: string; // BẮT BUỘC: Số điện thoại làm identifier chính

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  medical_history?: string;

  @IsOptional()
  @IsString()
  allergy_history?: string;
}