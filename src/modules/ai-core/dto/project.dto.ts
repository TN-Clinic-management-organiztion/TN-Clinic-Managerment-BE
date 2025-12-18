import { IsNotEmpty, IsString, IsEnum, IsBoolean, IsOptional, IsArray, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';
import { PageQueryDto } from 'src/modules/_shared/pagination';
import { AnnotationTaskType } from 'src/database/entities/ai/annotation_projects.entity';

export class CreateProjectDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsEnum(AnnotationTaskType)
  task_type: AnnotationTaskType;

  @IsNotEmpty()
  @IsUUID()
  created_by: string;
}

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class QueryProjectDto extends PageQueryDto {
  @IsOptional()
  @IsEnum(AnnotationTaskType)
  task_type?: AnnotationTaskType;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsUUID()
  created_by?: string;
}

export class AddImagesToProjectDto {
  @IsArray()
  @IsUUID('4', { each: true })
  image_ids: string[];

  @IsUUID()
  added_by: string;
}

export class AssignLabelersDto {
  @IsArray()
  @IsUUID('4', { each: true })
  labeler_ids: string[];
}