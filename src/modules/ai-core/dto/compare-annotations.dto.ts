import { IsUUID, IsNotEmpty } from 'class-validator';

export class CompareAnnotationsDto {
  @IsUUID()
  @IsNotEmpty()
  ai_annotation_id: string;

  @IsUUID()
  @IsNotEmpty()
  human_annotation_id: string;
}