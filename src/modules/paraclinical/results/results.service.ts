import { CreateResultImageDto } from './dto/images/create-image.dto';
import { UpdateResultImageDto } from './dto/images/update-image.dto';
import { QueryResultImageDto } from './dto/images/query-image.dto';
import { QueryDiscussionDto } from './dto/discussions/query-discussion.dto';
import { UpdateDiscussionDto } from './dto/discussions/update-discussion.dto';
import { CreateDiscussionDto } from './dto/discussions/create-discussion.dto';
import { QueryTemplateDto } from './dto/templates/query-template.dto';
import { UpdateTemplateDto } from './dto/templates/update-template.dto';
import { CreateTemplateDto } from './dto/templates/create-template.dto';
import { BulkUploadImagesDto } from './dto/images/bulk-upload-image.dto';
import { QueryResultDto } from './dto/results/query-result.dto';
import { UpdateResultDto } from './dto/results/update-result.dto';
import { CreateResultDto } from './dto/results/create-result.dto';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { ServiceResult } from 'src/database/entities/service/service_results.entity';
import { ResultImage } from 'src/database/entities/service/result_images.entity';
import { ServiceReportTemplate } from 'src/database/entities/service/service_report_templates.entity';
import { ResultDiscussion } from 'src/database/entities/service/result_discussions.entity';
import { CloudinaryService } from 'src/shared/cloudinary/cloudinary.service';
@Injectable()
export class ResultsService {
  constructor(
    @InjectRepository(ServiceResult)
    private resultRepo: Repository<ServiceResult>,
    @InjectRepository(ResultImage)
    private imageRepo: Repository<ResultImage>,
    @InjectRepository(ServiceReportTemplate)
    private templateRepo: Repository<ServiceReportTemplate>,
    @InjectRepository(ResultDiscussion)
    private discussionRepo: Repository<ResultDiscussion>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // ==================== SERVICE RESULTS ====================
  async createResult(dto: CreateResultDto): Promise<ServiceResult> {
    const result = this.resultRepo.create({
      request_item_id: dto.request_item_id,
      technician_id: dto.technician_id,
      approving_doctor_id: dto.approving_doctor_id ?? null,
      main_conclusion: dto.main_conclusion,
      report_body_html: dto.report_body_html,
      used_template_id: dto.used_template_id ?? null,
      is_abnormal: dto.is_abnormal ?? false,
    });

    return this.resultRepo.save(result);
  }

  async findAllResults(query: QueryResultDto) {
    const {
      page = 1,
      limit = 20,
      request_item_id,
      technician_id,
      approving_doctor_id,
      is_abnormal,
      used_template_id,
      result_time_from,
      result_time_to,
    } = query;

    const skip = (page - 1) * limit;
    const qb = this.resultRepo
      .createQueryBuilder('result')
      .leftJoinAndSelect('result.request_item', 'item')
      .leftJoinAndSelect('result.technician', 'tech')
      .leftJoinAndSelect('result.approving_doctor', 'doctor')
      .leftJoinAndSelect('result.used_template', 'template')
      .where('result.deleted_at IS NULL');

    if (request_item_id) {
      qb.andWhere('result.request_item_id = :request_item_id', {
        request_item_id,
      });
    }

    if (technician_id) {
      qb.andWhere('result.technician_id = :technician_id', { technician_id });
    }

    if (approving_doctor_id) {
      qb.andWhere('result.approving_doctor_id = :approving_doctor_id', {
        approving_doctor_id,
      });
    }

    if (is_abnormal !== undefined) {
      qb.andWhere('result.is_abnormal = :is_abnormal', { is_abnormal });
    }

    if (used_template_id !== undefined) {
      qb.andWhere('result.used_template_id = :used_template_id', {
        used_template_id,
      });
    }

    if (result_time_from) {
      qb.andWhere('result.result_time >= :from', {
        from: new Date(result_time_from),
      });
    }

    if (result_time_to) {
      qb.andWhere('result.result_time <= :to', {
        to: new Date(result_time_to),
      });
    }

    qb.orderBy('result.result_time', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOneResult(id: string): Promise<ServiceResult> {
    const result = await this.resultRepo.findOne({
      where: { result_id: id, deleted_at: IsNull() },
      relations: [
        'request_item',
        'technician',
        'approving_doctor',
        'used_template',
      ],
    });

    if (!result) throw new NotFoundException(`Result with ID ${id} not found`);
    return result;
  }

  async updateResult(id: string, dto: UpdateResultDto): Promise<ServiceResult> {
    const result = await this.findOneResult(id);
    Object.assign(result, dto);
    return await this.resultRepo.save(result);
  }

  async removeResult(id: string): Promise<void> {
    const result = await this.findOneResult(id);
    result.deleted_at = new Date();
    await this.resultRepo.save(result);
  }

  // ==================== RESULT IMAGES ====================
  async createImage(dto: CreateResultImageDto): Promise<ResultImage> {
    try {
      const image = this.imageRepo.create({
        result_id: dto.result_id || null,
        original_image_url: dto.original_image_url,
        public_id: dto.public_id,
        file_name: dto.file_name,
        file_size: dto.file_size,
        mime_type: dto.mime_type,
        uploaded_by: dto.uploaded_by,
      });

      return await this.imageRepo.save(image);
    } catch (error) {
      if (error.code === '23503') {
        throw new BadRequestException('Result or Staff not found');
      }
      throw new InternalServerErrorException('Failed to create image');
    }
  }

  async uploadImageToCloudinary(
    file: Express.Multer.File,
    dto: CreateResultImageDto,
  ): Promise<ResultImage> {
    try {
      if (!file) {
        throw new BadRequestException('File is required');
      }

      const cloudImage = await this.cloudinaryService.uploadMedicalImage(file);

      const image = this.imageRepo.create({
        result_id: dto.result_id || null,
        uploaded_by: dto.uploaded_by,
        original_image_url: cloudImage.secure_url,
        public_id: cloudImage.public_id,
        file_name: file.originalname,
        file_size: String(file.size),
        mime_type: file.mimetype,
      });

      return await this.imageRepo.save(image);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      if (error.code === '23503') {
        throw new BadRequestException('Result or Staff not found');
      }
      throw new InternalServerErrorException('Failed to upload image');
    }
  }

  async bulkUploadImages(
    files: Express.Multer.File[],
    dto: BulkUploadImagesDto,
  ): Promise<{
    uploaded: ResultImage[];
    failed: Array<{ index: number; reason: string }>;
  }> {
    if (!dto.images || dto.images.length !== files.length) {
      throw new BadRequestException('files and images length mismatch');
    }

    const uploaded: ResultImage[] = [];
    const failed: Array<{ index: number; reason: string }> = [];

    for (let i = 0; i < files.length; i++) {
      try {
        const image = await this.uploadImageToCloudinary(
          files[i],
          dto.images[i],
        );
        uploaded.push(image);
      } catch (e: any) {
        failed.push({ index: i, reason: e?.message ?? 'upload failed' });
      }
    }

    return { uploaded, failed };
  }

  async findAllImages(query: QueryResultImageDto) {
    const {
      page = 1,
      limit = 20,
      result_id,
      uploaded_by,
      mime_type,
      uploaded_from,
      uploaded_to,
    } = query;

    const skip = (page - 1) * limit;
    const qb = this.imageRepo
      .createQueryBuilder('image')
      .leftJoinAndSelect('image.result', 'result')
      .leftJoinAndSelect('image.uploader', 'uploader');

    if (result_id) {
      qb.andWhere('image.result_id = :result_id', { result_id });
    }

    if (uploaded_by) {
      qb.andWhere('image.uploaded_by = :uploaded_by', { uploaded_by });
    }

    if (mime_type) {
      qb.andWhere('image.mime_type = :mime_type', { mime_type });
    }

    if (uploaded_from) {
      qb.andWhere('image.uploaded_at >= :uploaded_from', { uploaded_from });
    }

    if (uploaded_to) {
      qb.andWhere('image.uploaded_at <= :uploaded_to', { uploaded_to });
    }

    qb.orderBy('image.uploaded_at', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOneImage(id: string): Promise<ResultImage> {
    const image = await this.imageRepo.findOne({
      where: { image_id: id },
      relations: ['result', 'uploader'],
    });

    if (!image) {
      throw new NotFoundException(`Image with ID ${id} not found`);
    }

    return image;
  }

  async updateImage(
    id: string,
    dto: UpdateResultImageDto,
  ): Promise<ResultImage> {
    const image = await this.findOneImage(id);
    Object.assign(image, dto);
    return await this.imageRepo.save(image);
  }

  async removeImage(id: string): Promise<void> {
    const image = await this.findOneImage(id);

    // Delete from Cloudinary if has public_id
    if (image.public_id) {
      try {
        await this.cloudinaryService.deleteImage(image.public_id);
      } catch (error) {
        console.error('Failed to delete from Cloudinary:', error);
      }
    }

    await this.imageRepo.remove(image);
  }

  // ==================== TEMPLATES ====================
  async createTemplate(dto: CreateTemplateDto): Promise<ServiceReportTemplate> {
    const template = this.templateRepo.create(dto);
    return await this.templateRepo.save(template);
  }

  async findAllTemplates(query: QueryTemplateDto) {
    const {
      page = 1,
      limit = 20,
      service_id,
      created_by,
      is_default,
      is_public,
      search,
    } = query;

    const skip = (page - 1) * limit;
    const qb = this.templateRepo
      .createQueryBuilder('template')
      .leftJoinAndSelect('template.service', 'service')
      .leftJoinAndSelect('template.creator', 'creator');

    if (service_id) {
      qb.andWhere('template.service_id = :service_id', { service_id });
    }

    if (created_by) {
      qb.andWhere('template.created_by = :created_by', { created_by });
    }

    if (is_default !== undefined) {
      qb.andWhere('template.is_default = :is_default', { is_default });
    }

    if (is_public !== undefined) {
      qb.andWhere('template.is_public = :is_public', { is_public });
    }

    if (search) {
      qb.andWhere('template.template_name ILIKE :search', {
        search: `%${search}%`,
      });
    }

    qb.orderBy('template.created_at', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOneTemplate(id: number): Promise<ServiceReportTemplate> {
    const template = await this.templateRepo.findOne({
      where: { template_id: id },
      relations: ['service', 'creator'],
    });

    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }

    return template;
  }

  async updateTemplate(
    id: number,
    dto: UpdateTemplateDto,
  ): Promise<ServiceReportTemplate> {
    const template = await this.findOneTemplate(id);
    Object.assign(template, dto);
    return await this.templateRepo.save(template);
  }

  async removeTemplate(id: number): Promise<void> {
    const template = await this.findOneTemplate(id);
    await this.templateRepo.remove(template);
  }

  // ==================== DISCUSSIONS ====================
  async createDiscussion(dto: CreateDiscussionDto): Promise<ResultDiscussion> {
    return this.discussionRepo.manager.transaction(async (em) => {
      const repo = em.getRepository(ResultDiscussion);

      await em.getRepository(ServiceResult).findOne({
        where: { result_id: dto.result_id },
        lock: { mode: 'pessimistic_write' },
      });

      let lft = 1;
      let rgt = 2;

      if (dto.parent_id) {
        // (khuyến nghị) lock parent để tránh 2 request cùng chèn
        const parent = await repo.findOne({
          where: { discussion_id: dto.parent_id, result_id: dto.result_id },
          lock: { mode: 'pessimistic_write' },
        });

        if (!parent) throw new NotFoundException('Parent discussion not found');

        await repo
          .createQueryBuilder()
          .update(ResultDiscussion)
          .set({ rgt: () => 'rgt + 2' })
          .where('result_id = :rid AND rgt >= :parentRgt', {
            rid: dto.result_id,
            parentRgt: parent.rgt,
          })
          .execute();

        await repo
          .createQueryBuilder()
          .update(ResultDiscussion)
          .set({ lft: () => 'lft + 2' })
          .where('result_id = :rid AND lft > :parentRgt', {
            rid: dto.result_id,
            parentRgt: parent.rgt,
          })
          .execute();

        lft = parent.rgt;
        rgt = parent.rgt + 1;
      } else {
        // (khuyến nghị) lock theo result_id để tránh 2 root insert cùng lúc
        const max = await repo
          .createQueryBuilder('d')
          .select('MAX(d.rgt)', 'max')
          .where('d.result_id = :rid', { rid: dto.result_id })
          .setLock('pessimistic_write') // lock phạm vi query trong tx
          .getRawOne();

        if (max?.max) {
          lft = Number(max.max) + 1;
          rgt = lft + 1;
        }
      }

      const discussion = repo.create({ ...dto, lft, rgt });
      return repo.save(discussion);
    });
  }

  async findAllDiscussions(query: QueryDiscussionDto) {
    const { page = 1, limit = 20, result_id, sender_id } = query;

    const skip = (page - 1) * limit;
    const qb = this.discussionRepo
      .createQueryBuilder('discussion')
      .leftJoinAndSelect('discussion.result', 'result')
      .leftJoinAndSelect('discussion.sender', 'sender')
      .leftJoinAndSelect('discussion.parent', 'parent');

    if (result_id) {
      qb.andWhere('discussion.result_id = :result_id', { result_id });
    }

    if (sender_id) {
      qb.andWhere('discussion.sender_id = :sender_id', { sender_id });
    }

    qb.orderBy('discussion.lft', 'ASC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOneDiscussion(id: string): Promise<ResultDiscussion> {
    const discussion = await this.discussionRepo.findOne({
      where: { discussion_id: id },
      relations: ['result', 'sender', 'parent'],
    });

    if (!discussion) {
      throw new NotFoundException(`Discussion with ID ${id} not found`);
    }

    return discussion;
  }

  async updateDiscussion(
    id: string,
    dto: UpdateDiscussionDto,
  ): Promise<ResultDiscussion> {
    const discussion = await this.findOneDiscussion(id);
    discussion.message_content = dto.message_content;
    return await this.discussionRepo.save(discussion);
  }

  async removeDiscussion(id: string): Promise<void> {
    await this.discussionRepo.manager.transaction(async (em) => {
      const repo = em.getRepository(ResultDiscussion);

      const discussion = await repo.findOne({
        where: { discussion_id: id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!discussion)
        throw new NotFoundException(`Discussion with ID ${id} not found`);

      await em.getRepository(ServiceResult).findOne({
        where: { result_id: discussion.result_id },
        lock: { mode: 'pessimistic_write' },
      });

      const width = discussion.rgt - discussion.lft + 1;

      await repo
        .createQueryBuilder()
        .delete()
        .from(ResultDiscussion)
        .where('result_id = :rid AND lft >= :lft AND rgt <= :rgt', {
          rid: discussion.result_id,
          lft: discussion.lft,
          rgt: discussion.rgt,
        })
        .execute();

      await repo
        .createQueryBuilder()
        .update(ResultDiscussion)
        .set({ lft: () => `lft - ${width}` })
        .where('result_id = :rid AND lft > :rgt', {
          rid: discussion.result_id,
          rgt: discussion.rgt,
        })
        .execute();

      await repo
        .createQueryBuilder()
        .update(ResultDiscussion)
        .set({ rgt: () => `rgt - ${width}` })
        .where('result_id = :rid AND rgt > :rgt', {
          rid: discussion.result_id,
          rgt: discussion.rgt,
        })
        .execute();
    });
  }

  // Get discussion tree for a result
  async getDiscussionTree(resultId: string) {
    const discussions = await this.discussionRepo
      .createQueryBuilder('discussion')
      .leftJoinAndSelect('discussion.sender', 'sender')
      .where('discussion.result_id = :resultId', { resultId })
      .orderBy('discussion.lft', 'ASC')
      .getMany();

    return this.buildTree(discussions);
  }

  private buildTree(discussions: ResultDiscussion[]): any[] {
    const tree: any[] = [];
    const stack: any[] = [];

    discussions.forEach((discussion) => {
      const node = {
        ...discussion,
        children: [],
      };

      while (stack.length > 0 && stack[stack.length - 1].rgt < discussion.lft) {
        stack.pop();
      }

      if (stack.length === 0) {
        tree.push(node);
      } else {
        stack[stack.length - 1].children.push(node);
      }

      stack.push(node);
    });

    return tree;
  }
}
