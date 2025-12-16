import { IsArray, IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import { AnnotationStatus } from 'src/database/entities/ai/image_annotations.entity';

export class SaveHumanAnnotationDto {
  @IsArray() 
  @IsNotEmpty()
  annotation_data: any[]; 

  @IsUUID()
  @IsNotEmpty()
  labeled_by: string;

  // Enum validation: Đảm bảo FE gửi đúng string 'DRAFT' | 'REVIEWED'
  @IsEnum(AnnotationStatus)
  @IsOptional()
  annotation_status?: AnnotationStatus;
}

// DTO dùng khi Bác sĩ quản lý vào Approve
export class ApproveAnnotationDto {
  @IsUUID()
  @IsNotEmpty()
  approved_by: string; // ID bác sĩ duyệt (staff_id)
}

export class RejectAnnotationDto {
  @IsUUID()
  @IsNotEmpty()
  rejected_by: string; // Người từ chối

  @IsString()
  @IsNotEmpty()
  reason: string; // Lý do bắt buộc
}