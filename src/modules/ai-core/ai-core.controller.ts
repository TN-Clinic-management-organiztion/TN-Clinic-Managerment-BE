import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AiCoreService } from 'src/modules/ai-core/ai-core.service';
import { RunAiDetectionDto } from 'src/modules/ai-core/dto/run-ai-detection.dto.ts';

@Controller('ai-core')
export class AiCoreController {
  constructor(private readonly aiCoreService: AiCoreService) {}

  @Post('detect')
  @HttpCode(HttpStatus.OK)
  async triggerDetection(@Body() dto: RunAiDetectionDto) {
    console.log('dto: ', dto);
    return await this.aiCoreService.runDetectionForImage(dto);
  }
}
