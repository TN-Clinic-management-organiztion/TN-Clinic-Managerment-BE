// result-images.controller.ts
import { Controller, Post, Body, Get, Query, Param, Patch, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ResultsService } from './results.service';
import { CreateResultImageDto } from './dto/result_images/create-result-image.dto';
import { UpdateResultImageDto } from './dto/result_images/update-result-image.dto';
import { QueryResultImageDto } from './dto/result_images/query-result-image.dto';
import { ResultImageResponseDto } from './dto/result_images/response-result-image.dto';
import { BulkUploadResultImagesDto } from './dto/result_images/bulk-upload-result-image.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('result')
@Controller('results')
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  @Post('images')
  async uploadResultImage(@Body() dto: CreateResultImageDto) {
    return await this.resultsService.createResultImage(dto);
  }

  @Post('images-cloudinary')
  @UseInterceptors(FileInterceptor('file'))
  async uploadResultImageCloundinary(@UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateResultImageDto) {
      return await this.resultsService.createResultImageCloundinary(file, dto);
    }
}