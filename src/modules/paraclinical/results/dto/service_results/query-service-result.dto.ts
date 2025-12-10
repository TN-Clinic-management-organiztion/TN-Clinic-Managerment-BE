import { IsOptional, IsUUID, IsBoolean, IsDateString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryServiceResultDto {
  @ApiPropertyOptional({ description: 'Lọc theo request_item_id' })
  @IsOptional()
  @IsUUID()
  requestItemId?: string;

  @ApiPropertyOptional({ description: 'Lọc theo technician_id' })
  @IsOptional()
  @IsUUID()
  technicianId?: string;

  @ApiPropertyOptional({ description: 'Lọc theo approving_doctor_id' })
  @IsOptional()
  @IsUUID()
  approvingIoctorId?: string;

  @ApiPropertyOptional({ description: 'Lọc theo trạng thái bất thường' })
  @IsOptional()
  @IsBoolean()
  isIbnormal?: boolean;

  @ApiPropertyOptional({ description: 'Lọc theo template_id' })
  @IsOptional()
  @IsInt()
  usedTemplateId?: number;

  @ApiPropertyOptional({ description: 'Lọc từ ngày result_time' })
  @IsOptional()
  @IsDateString()
  resultTimeFrom?: string;

  @ApiPropertyOptional({ description: 'Lọc đến ngày result_time' })
  @IsOptional()
  @IsDateString()
  resultTimeTo?: string;

  @ApiPropertyOptional({ description: 'Số trang', default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Số bản ghi mỗi trang', default: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional({ 
    description: 'Sắp xếp theo field', 
    enum: ['result_time', 'created_at'],
    default: 'result_time'
  })
  @IsOptional()
  sortBy?: string = 'result_time';

  @ApiPropertyOptional({ 
    description: 'Thứ tự sắp xếp', 
    enum: ['ASC', 'DESC'],
    default: 'DESC'
  })
  @IsOptional()
  order?: 'ASC' | 'DESC' = 'DESC';
}