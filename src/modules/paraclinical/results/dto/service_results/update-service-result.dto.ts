import { PartialType } from '@nestjs/mapped-types';
import { CreateServiceResultDto } from './create-service-result.dto';
import { IsOptional, IsBoolean, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateServiceResultDto extends PartialType(CreateServiceResultDto) {
  @ApiPropertyOptional({ description: 'Kết luận chính (cập nhật)' })
  @IsOptional()
  @IsString()
  mainConclusion?: string;

  @ApiPropertyOptional({ description: 'Nội dung báo cáo HTML (cập nhật)' })
  @IsOptional()
  @IsString()
  reportBodyHtml?: string;

  @ApiPropertyOptional({ description: 'Cập nhật trạng thái bất thường' })
  @IsOptional()
  @IsBoolean()
  isAbnormal?: boolean;
}