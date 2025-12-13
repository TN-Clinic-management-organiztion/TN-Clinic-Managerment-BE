import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterIcd10Dto {
  @IsOptional()
  @Type(() => Number) // Chuyển string từ query param thành number
  @IsInt()
  @Min(1)
  page?: number = 1; // Mặc định trang 1

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10; // Mặc định 10 dòng/trang

  @IsOptional()
  @IsString()
  search?: string; // Tìm kiếm theo mã hoặc tên
}