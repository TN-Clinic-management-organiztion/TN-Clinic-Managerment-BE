// result-images.controller.ts
import { Controller, Post, Body, Get, Query, Param, Patch, Delete } from '@nestjs/common';
import { ResultsService } from './results.service';
import { CreateResultImageDto } from './dto/result_images/create-result-image.dto';
import { UpdateResultImageDto } from './dto/result_images/update-result-image.dto';
import { QueryResultImageDto } from './dto/result_images/query-result-image.dto';
import { ResultImageResponseDto } from './dto/result_images/response-result-image.dto';
import { BulkUploadResultImagesDto } from './dto/result_images/bulk-upload-result-image.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('result-images')
@Controller('result-images')
export class ResultImagesController {
  // constructor(private readonly resultImagesService: ResultsService) {}

  // @Post()
  // @ApiOperation({ summary: 'Tạo ảnh kết quả mới' })
  // @ApiResponse({ type: ResultImageResponseDto })
  // async create(
  //   @Body() createResultImageDto: CreateResultImageDto
  // ): Promise<ResultImageResponseDto> {
  //   return this.resultImagesService.create(createResultImageDto);
  // }

  // @Post('bulk')
  // @ApiOperation({ summary: 'Upload nhiều ảnh cùng lúc' })
  // async bulkCreate(
  //   @Body() bulkUploadDto: BulkUploadResultImagesDto
  // ): Promise<ResultImageResponseDto[]> {
  //   return this.resultImagesService.bulkCreate(bulkUploadDto.images);
  // }

  // @Get()
  // @ApiOperation({ summary: 'Lấy danh sách ảnh với filter' })
  // async findAll(
  //   @Query() queryDto: QueryResultImageDto
  // ): Promise<{
  //   data: ResultImageResponseDto[];
  //   total: number;
  //   page: number;
  //   limit: number;
  // }> {
  //   return this.resultImagesService.findAll(queryDto);
  // }

  // @Get(':id')
  // @ApiOperation({ summary: 'Lấy ảnh theo ID' })
  // async findOne(@Param('id') id: string): Promise<ResultImageResponseDto> {
  //   return this.resultImagesService.findOne(id);
  // }

  // @Get('result/:resultId')
  // @ApiOperation({ summary: 'Lấy tất cả ảnh của một kết quả' })
  // async findByResultId(
  //   @Param('resultId') resultId: string
  // ): Promise<ResultImageResponseDto[]> {
  //   return this.resultImagesService.findByResultId(resultId);
  // }

  // @Patch(':id')
  // @ApiOperation({ summary: 'Cập nhật thông tin ảnh' })
  // async update(
  //   @Param('id') id: string,
  //   @Body() updateResultImageDto: UpdateResultImageDto
  // ): Promise<ResultImageResponseDto> {
  //   return this.resultImagesService.update(id, updateResultImageDto);
  // }

  // @Delete(':id')
  // @ApiOperation({ summary: 'Xóa ảnh' })
  // async remove(@Param('id') id: string): Promise<void> {
  //   return this.resultImagesService.remove(id);
  // }
}