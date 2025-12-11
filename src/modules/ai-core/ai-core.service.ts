import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ImageAnnotation,
  AnnotationSource,
  AnnotationStatus,
} from 'src/database/entities/ai/image_annotations.entity';
import { ResultImage } from 'src/database/entities/service/result_images.entity';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { RunAiDetectionDto } from 'src/modules/ai-core/dto/run-ai-detection.dto.ts';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AiCoreService {
  private readonly logger = new Logger(AiCoreService.name);
  private readonly aiServiceUrl: string;

  constructor(
    @InjectRepository(ResultImage)
    private readonly resultImageRepo: Repository<ResultImage>,
    @InjectRepository(ImageAnnotation)
    private readonly imageAnnotationRepo: Repository<ImageAnnotation>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.aiServiceUrl =
      this.configService.get<string>('AI_SERVICE_URL') ||
      'http://localhost:8000/api/v1';
  }

  async runDetectionForImage(dto: RunAiDetectionDto) {
    const imageRecord = await this.resultImageRepo.findOne({
      where: { image_id: dto.image_id },
    });

    if (!imageRecord) {
      throw new NotFoundException(`Image with ID ${dto.image_id} not found`);
    }

    if (!imageRecord.original_image_url) {
      throw new NotFoundException('Image URL is empty');
    }

    try {
      this.logger.log(`Sending image ${dto.image_id} to AI Service...`);

      const aiPayload = {
        image_url: imageRecord.original_image_url,
        model_name: dto.model_name,
        confidence_threshold: dto.confidence,
        iou_threshold: 0.4,
      };

      const response = await firstValueFrom(
        this.httpService.post(`${this.aiServiceUrl}/detect/url`, aiPayload),
      );

      const aiResult = response.data;

      console.log('aiResult: ', aiResult);

      const newAnnotation = this.imageAnnotationRepo.create({
        image_id: imageRecord.image_id,
        annotation_source: AnnotationSource.AI,
        annotation_data: aiResult.detections,
        ai_model_name: aiResult.model,
        ai_model_version: 'v1.0',
        // Status Enum
        annotation_status: AnnotationStatus.DRAFT,
        labeled_at: new Date(),
      });

      const savedAnnotation =
        await this.imageAnnotationRepo.save(newAnnotation);

      return {
        message: 'AI Detection completed',
        data: savedAnnotation,
      };
    } catch (error) {
      this.logger.error(
        'Error calling AI Service',
        error.response?.data || error.message,
      );
      throw new InternalServerErrorException('Failed to process image with AI');
    }
  }
}
