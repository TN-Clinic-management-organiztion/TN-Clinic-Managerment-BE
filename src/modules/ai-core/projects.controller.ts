// src/modules/ai-core/projects.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import {
  CreateProjectDto,
  UpdateProjectDto,
  QueryProjectDto,
  AddImagesToProjectDto,
} from './dto/project.dto';

@ApiTags('AI Projects')
@Controller('ai-core/projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  // ==================== PROJECT CRUD ====================

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new annotation project' })
  async createProject(@Body() dto: CreateProjectDto) {
    return await this.projectsService.createProject(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all projects with pagination' })
  async findAllProjects(@Query() query: QueryProjectDto) {
    return await this.projectsService.findAllProjects(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project detail with statistics' })
  async findOneProject(@Param('id') id: string) {
    return await this.projectsService.findOneProject(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update project' })
  async updateProject(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return await this.projectsService.updateProject(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete project and all image links' })
  async deleteProject(@Param('id') id: string) {
    return await this.projectsService.deleteProject(id);
  }

  // ==================== PROJECT IMAGES ====================

  @Post(':id/images')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add images to project' })
  async addImagesToProject(
    @Param('id') id: string,
    @Body() dto: AddImagesToProjectDto,
  ) {
    return await this.projectsService.addImagesToProject(id, dto);
  }

  @Get(':id/images')
  @ApiOperation({ summary: 'Get all images in project' })
  async getProjectImages(
    @Param('id') id: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return await this.projectsService.getProjectImages(id, page, limit);
  }

  @Delete(':projectId/images/:imageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove image from project' })
  async removeImageFromProject(
    @Param('projectId') projectId: string,
    @Param('imageId') imageId: string,
  ) {
    return await this.projectsService.removeImageFromProject(
      projectId,
      imageId,
    );
  }

  @Post(':id/images/bulk-remove')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove multiple images from project' })
  async bulkRemoveImages(
    @Param('id') id: string,
    @Body('image_ids') imageIds: string[],
  ) {
    return await this.projectsService.bulkRemoveImages(id, imageIds);
  }

  // ==================== PROJECT PROGRESS ====================

  @Get(':id/progress')
  @ApiOperation({ summary: 'Get project progress statistics' })
  async getProjectProgress(@Param('id') id: string) {
    return await this.projectsService.getProjectProgress(id);
  }
}