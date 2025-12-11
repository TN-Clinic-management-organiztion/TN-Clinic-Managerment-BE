import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

import { AiCoreController } from './ai-core.controller';
import { AiCoreService } from './ai-core.service';

// Import Entities
import { ImageAnnotation } from 'src/database/entities/ai/image_annotations.entity';
import { ResultImage } from 'src/database/entities/service/result_images.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ImageAnnotation, ResultImage]),
    // Module support call API (axios wrapper)
    HttpModule,
    ConfigModule,
  ],
  controllers: [AiCoreController],
  providers: [AiCoreService],
  exports: [AiCoreService],
})
export class AiCoreModule {}