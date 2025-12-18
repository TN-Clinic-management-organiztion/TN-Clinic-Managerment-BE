import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

import { AiCoreController } from './ai-core.controller';
import { AiCoreService } from './ai-core.service';

// Import Entities
import { ImageAnnotation } from 'src/database/entities/ai/image_annotations.entity';
import { ResultImage } from 'src/database/entities/service/result_images.entity';
import { AnnotationProject } from 'src/database/entities/ai/annotation_projects.entity';
import { AnnotationProjectImage } from 'src/database/entities/ai/annotation_project_images.entity';
import { ProjectsController } from 'src/modules/ai-core/projects.controller';
import { ProjectsService } from 'src/modules/ai-core/projects.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ImageAnnotation,
      ResultImage,
      AnnotationProject,
      AnnotationProjectImage,
    ]),
    // Module support call API (axios wrapper)
    HttpModule,
    ConfigModule,
  ],
  controllers: [AiCoreController, ProjectsController],
  providers: [AiCoreService, ProjectsService],
  exports: [AiCoreService, ProjectsService],
})
export class AiCoreModule {}
