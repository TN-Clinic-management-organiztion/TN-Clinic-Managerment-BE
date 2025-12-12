import { RunAiDetectionDto } from 'src/modules/ai-core/dto/run-ai-detection.dto.ts';
import { Body, Controller, DefaultValuePipe, Get, HttpCode, HttpStatus, NotFoundException, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { AiCoreService } from './ai-core.service';
import { SaveHumanAnnotationDto, ApproveAnnotationDto, RejectAnnotationDto } from './dto/human-annotation.dto';

@Controller('ai-core')
export class AiCoreController {
  constructor(private readonly aiCoreService: AiCoreService) {}

  // 1. Chạy AI Detect
  @Post('detect')
  @HttpCode(HttpStatus.OK)
  async triggerDetection(@Body() dto: RunAiDetectionDto) {
    return await this.aiCoreService.runDetectionForImage(dto);
  }

  // 2. Lấy danh sách ảnh (Gallery)
  @Get('result-images')
  async getListResultImages(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return await this.aiCoreService.getListResultImages(page, limit, status, search);
  }

  // 3. Lấy chi tiết ảnh (Workspace)
  @Get('result-images/:image_id')
  async getResultImageDetail(@Param('image_id') image_id: string) {
    const data = await this.aiCoreService.getResultImageDetail(image_id);
    if (!data) throw new NotFoundException('Image not found');
    return data;
  }

  // 4. Lưu kết quả (Nộp bài / Chỉnh sửa)
  @Post('result-images/:image_id/human-annotations')
  async saveHumanAnnotation(
    @Param('image_id') image_id: string,
    @Body() dto: SaveHumanAnnotationDto,
  ) {
    return await this.aiCoreService.upsertHumanAnnotation(image_id, dto);
  }

  // 5. Duyệt (Approve)
  @Patch('result-images/:image_id/approve')
  async approveHumanAnnotation(
    @Param('image_id') image_id: string,
    @Body() dto: ApproveAnnotationDto,
  ) {
    return await this.aiCoreService.approveHumanAnnotation(image_id, dto);
  }

  // 6. Từ chối (Reject)
  @Patch('result-images/:image_id/reject')
  async rejectAnnotation(
    @Param('image_id') id: string,
    @Body() dto: RejectAnnotationDto,
  ) {
    return await this.aiCoreService.rejectAnnotation(id, dto);
  }
}