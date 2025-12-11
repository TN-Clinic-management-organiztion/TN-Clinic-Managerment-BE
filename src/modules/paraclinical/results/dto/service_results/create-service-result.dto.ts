import { IsUUID, IsOptional, IsBoolean, IsString, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateServiceResultDto {
  @ApiProperty({ description: 'ID của item yêu cầu dịch vụ' })
  @IsUUID()
  requestItemId: string;

  @ApiProperty({ description: 'ID của kỹ thuật viên thực hiện' })
  @IsUUID()
  technicianId: string;

  @ApiPropertyOptional({ description: 'ID của bác sĩ phê duyệt' })
  @IsOptional()
  @IsUUID()
  approvingDoctorId?: string;

  @ApiPropertyOptional({ description: 'Kết luận chính' })
  @IsOptional()
  @IsString()
  mainConclusion?: string;

  @ApiPropertyOptional({ description: 'Nội dung báo cáo HTML' })
  @IsOptional()
  @IsString()
  reportBodyHtml?: string;

  @ApiPropertyOptional({ description: 'ID template báo cáo sử dụng' })
  @IsOptional()
  @IsInt()
  usedTemplateId?: number;

  @ApiPropertyOptional({ description: 'Kết quả có bất thường không' })
  @IsOptional()
  @IsBoolean()
  isAbnormal?: boolean = false;
}