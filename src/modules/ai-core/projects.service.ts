// src/modules/ai-core/projects.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { AnnotationProject } from 'src/database/entities/ai/annotation_projects.entity';
import { AnnotationProjectImage } from 'src/database/entities/ai/annotation_project_images.entity';
import { ResultImage } from 'src/database/entities/service/result_images.entity';
import { 
  CreateProjectDto, 
  UpdateProjectDto, 
  QueryProjectDto,
  AddImagesToProjectDto,
} from './dto/project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(AnnotationProject)
    private projectRepo: Repository<AnnotationProject>,
    @InjectRepository(AnnotationProjectImage)
    private projectImageRepo: Repository<AnnotationProjectImage>,
    @InjectRepository(ResultImage)
    private imageRepo: Repository<ResultImage>,
  ) {}

  // ==================== PROJECT CRUD ====================
  
  async createProject(dto: CreateProjectDto): Promise<AnnotationProject> {
    const project = this.projectRepo.create(dto);
    return await this.projectRepo.save(project);
  }

  async findAllProjects(query: QueryProjectDto) {
    const { page = 1, limit = 20, task_type, is_active, created_by, search } = query;
    const skip = (page - 1) * limit;

    const qb = this.projectRepo
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.creator', 'creator');

    if (task_type) {
      qb.andWhere('project.task_type = :task_type', { task_type });
    }

    if (is_active !== undefined) {
      qb.andWhere('project.is_active = :is_active', { is_active });
    }

    if (created_by) {
      qb.andWhere('project.created_by = :created_by', { created_by });
    }

    if (search) {
      qb.andWhere('project.name ILIKE :search', { search: `%${search}%` });
    }

    qb.orderBy('project.created_at', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    // Get image count for each project
    const projectsWithStats = await Promise.all(
      data.map(async (project) => {
        const imageCount = await this.projectImageRepo.count({
          where: { project_id: project.project_id },
        });

        return {
          ...project,
          image_count: imageCount,
        };
      }),
    );

    return {
      data: projectsWithStats,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOneProject(id: string) {
    const project = await this.projectRepo.findOne({
      where: { project_id: id },
      relations: ['creator'],
    });

    if (!project) {
      throw new NotFoundException(`Project ${id} not found`);
    }

    // Get statistics
    const [totalImages, annotatedImages] = await Promise.all([
      this.projectImageRepo.count({
        where: { project_id: id },
      }),
      this.projectImageRepo
        .createQueryBuilder('pi')
        .innerJoin(
          'image_annotations',
          'ann',
          'ann.image_id = pi.image_id AND ann.annotation_status = :status',
          { status: 'APPROVED' },
        )
        .where('pi.project_id = :id', { id })
        .getCount(),
    ]);

    return {
      ...project,
      statistics: {
        total_images: totalImages,
        annotated_images: annotatedImages,
        pending_images: totalImages - annotatedImages,
        completion_rate:
          totalImages > 0
            ? ((annotatedImages / totalImages) * 100).toFixed(2)
            : 0,
      },
    };
  }

  async updateProject(id: string, dto: UpdateProjectDto): Promise<AnnotationProject> {
    const project = await this.projectRepo.findOne({
      where: { project_id: id },
    });

    if (!project) {
      throw new NotFoundException(`Project ${id} not found`);
    }

    Object.assign(project, dto);
    return await this.projectRepo.save(project);
  }

  async deleteProject(id: string): Promise<void> {
    const project = await this.projectRepo.findOne({
      where: { project_id: id },
    });

    if (!project) {
      throw new NotFoundException(`Project ${id} not found`);
    }

    // Delete all project-image links first
    await this.projectImageRepo.delete({ project_id: id });

    // Then delete project
    await this.projectRepo.remove(project);
  }

  // ==================== PROJECT IMAGES MANAGEMENT ====================

  async addImagesToProject(projectId: string, dto: AddImagesToProjectDto) {
    // Validate project exists
    const project = await this.projectRepo.findOne({
      where: { project_id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }

    // Validate images exist
    const images = await this.imageRepo.find({
      where: { image_id: In(dto.image_ids) },
    });

    if (images.length !== dto.image_ids.length) {
      throw new NotFoundException('Some images not found');
    }

    // Check for existing links
    const existingLinks = await this.projectImageRepo.find({
      where: {
        project_id: projectId,
        image_id: In(dto.image_ids),
      },
    });

    const existingImageIds = existingLinks.map((link) => link.image_id);
    const newImageIds = dto.image_ids.filter(
      (id) => !existingImageIds.includes(id),
    );

    if (newImageIds.length === 0) {
      return {
        message: 'All images already in project',
        added: 0,
        skipped: dto.image_ids.length,
      };
    }

    // Add new images
    const projectImages = newImageIds.map((imageId) =>
      this.projectImageRepo.create({
        project_id: projectId,
        image_id: imageId,
        added_by: dto.added_by,
      }),
    );

    await this.projectImageRepo.save(projectImages);

    return {
      message: `Added ${newImageIds.length} images to project`,
      added: newImageIds.length,
      skipped: existingImageIds.length,
    };
  }

  async removeImageFromProject(projectId: string, imageId: string) {
    const result = await this.projectImageRepo.delete({
      project_id: projectId,
      image_id: imageId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('Image not found in project');
    }

    return { message: 'Image removed from project' };
  }

  async getProjectImages(projectId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const qb = this.projectImageRepo
      .createQueryBuilder('pi')
      .leftJoinAndSelect('pi.image', 'img')
      .leftJoinAndSelect('img.uploader', 'uploader')
      .leftJoin(
        'image_annotations',
        'ann',
        'ann.image_id = img.image_id AND ann.annotation_source = :source',
        { source: 'HUMAN' },
      )
      .addSelect([
        'ann.annotation_status',
        'ann.labeled_by',
        'ann.approved_by',
      ])
      .where('pi.project_id = :projectId', { projectId })
      .orderBy('pi.added_at', 'DESC')
      .skip(skip)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data: data.map((pi) => ({
        image_id: pi.image_id,
        file_name: pi.image?.file_name,
        original_image_url: pi.image?.original_image_url,
        uploaded_by: pi.image?.uploader?.full_name,
        added_at: pi.added_at,
        annotation_status: (pi as any).ann?.annotation_status || 'UNLABELED',
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async bulkRemoveImages(projectId: string, imageIds: string[]) {
    const result = await this.projectImageRepo.delete({
      project_id: projectId,
      image_id: In(imageIds),
    });

    return {
      message: `Removed ${result.affected} images from project`,
      removed: result.affected,
    };
  }

  // ==================== PROJECT PROGRESS ====================

  async getProjectProgress(projectId: string) {
    const project = await this.projectRepo.findOne({
      where: { project_id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }

    // Get image status breakdown
    const statusBreakdown = await this.projectImageRepo
      .createQueryBuilder('pi')
      .leftJoin(
        'image_annotations',
        'ann',
        'ann.image_id = pi.image_id AND ann.annotation_source = :source',
        { source: 'HUMAN' },
      )
      .select('ann.annotation_status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('pi.project_id = :projectId', { projectId })
      .groupBy('ann.annotation_status')
      .getRawMany();

    const totalImages = await this.projectImageRepo.count({
      where: { project_id: projectId },
    });

    const statusMap = {
      UNLABELED: 0,
      IN_PROGRESS: 0,
      SUBMITTED: 0,
      APPROVED: 0,
      REJECTED: 0,
      DEPRECATED: 0,
    };

    statusBreakdown.forEach((row) => {
      const status = row.status || 'UNLABELED';
      statusMap[status] = parseInt(row.count);
    });

    return {
      project_id: projectId,
      project_name: project.name,
      total_images: totalImages,
      status_breakdown: statusMap,
      completion_rate:
        totalImages > 0
          ? ((statusMap.APPROVED / totalImages) * 100).toFixed(2)
          : 0,
    };
  }
}
