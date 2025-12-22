import { IsOptional, IsString, IsEnum } from 'class-validator';
import { PageQueryDto } from 'src/modules/_shared/pagination';

export enum ImageFilterStatus {
  TODO = 'TODO',       // Chưa có gì hoặc đang làm dở
  REVIEW = 'REVIEW',   // Đã nộp, chờ duyệt
  DONE = 'DONE',       // Đã duyệt
}

export class QueryResultImagesDto extends PageQueryDto {
  @IsOptional()
  @IsEnum(ImageFilterStatus)
  status?: ImageFilterStatus;
}