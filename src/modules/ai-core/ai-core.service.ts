import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, Not, In } from 'typeorm'; // Import Not
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

import {
  ImageAnnotation,
  AnnotationSource,
  AnnotationStatus,
} from 'src/database/entities/ai/image_annotations.entity';
import { ResultImage } from 'src/database/entities/service/result_images.entity';
import { StaffProfile } from 'src/database/entities/auth/staff_profiles.entity';
import {
  ApproveAnnotationDto,
  RejectAnnotationDto,
  SaveHumanAnnotationDto,
} from './dto/human-annotation.dto';
import { RunAiDetectionDto } from './dto/run-ai-detection.dto.ts';

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

  // --- 1. AI DETECTION ---
  async runDetectionForImage(dto: RunAiDetectionDto) {
    const imageRecord = await this.resultImageRepo.findOne({
      where: { image_id: dto.image_id },
    });

    if (!imageRecord) throw new NotFoundException(`Image not found`);
    if (!imageRecord.original_image_url)
      throw new NotFoundException('Image URL empty');

    try {
      this.logger.log(`Sending image ${dto.image_id} to AI...`);
      const response = await firstValueFrom(
        this.httpService.post(`${this.aiServiceUrl}/detect/url`, {
          image_url: imageRecord.original_image_url,
          model_name: dto.model_name,
          confidence_threshold: dto.confidence,
          iou_threshold: 0.4,
        }),
      );

      const newAnnotation = this.imageAnnotationRepo.create({
        image_id: imageRecord.image_id,
        annotation_source: AnnotationSource.AI,
        annotation_data: response.data.detections,
        ai_model_name: response.data.model,
        ai_model_version: 'v1.0',
        annotation_status: AnnotationStatus.APPROVED, // AI mặc định là APPROVED để tham khảo
        labeled_at: new Date(),
      });

      return await this.imageAnnotationRepo.save(newAnnotation);
    } catch (error) {
      this.logger.error('AI Service Error', error.message);
      throw new InternalServerErrorException('AI Service Failed');
    }
  }

  // --- 2. GET LIST (GALLERY) ---
  async getListResultImages(
    page: number,
    limit: number,
    filterStatus?: string,
    searchName?: string,
  ) {
    const query = this.resultImageRepo
      .createQueryBuilder('img')
      .leftJoinAndMapOne(
        'img.uploader',
        StaffProfile,
        'uploader',
        'uploader.staff_id = img.uploaded_by',
      )
      .leftJoinAndMapMany(
        'img.annotations',
        ImageAnnotation,
        'ann',
        'ann.image_id = img.image_id',
      )
      .leftJoinAndMapOne(
        'ann.labeler',
        StaffProfile,
        'labeler',
        'labeler.staff_id = ann.labeled_by',
      )
      .leftJoinAndMapOne(
        'ann.approver',
        StaffProfile,
        'approver',
        'approver.staff_id = ann.approved_by',
      )
      .orderBy('img.uploaded_at', 'DESC');

    // Filter Search
    if (searchName) {
      query.andWhere(
        '(img.file_name ILIKE :search OR uploader.full_name ILIKE :search)',
        { search: `%${searchName}%` },
      );
    }

    // Filter Status (Logic Server-side)
    if (filterStatus) {
      if (filterStatus === 'DONE') {
        // Lấy ảnh CÓ annotation APPROVED
        query.andWhere('ann.annotation_status = :st', {
          st: AnnotationStatus.APPROVED,
        });
      } else if (filterStatus === 'REVIEW') {
        // Lấy ảnh CÓ annotation SUBMITTED
        query.andWhere('ann.annotation_status = :st', {
          st: AnnotationStatus.SUBMITTED,
        });
      } else if (filterStatus === 'TODO') {
        // Lấy ảnh Chưa có gì HOẶC đang làm dở/bị từ chối (và chưa bị deprecated)
        query.andWhere(
          new Brackets((qb) => {
            qb.where('ann.annotation_id IS NULL').orWhere(
              'ann.annotation_source = :src AND ann.annotation_status IN (:...st)',
              {
                src: AnnotationSource.HUMAN,
                st: [AnnotationStatus.IN_PROGRESS, AnnotationStatus.REJECTED],
              },
            );
          }),
        );
      }
    }

    const totalItems = await query.getCount();
    query.skip((page - 1) * limit).take(limit);
    const rawResults = await query.getMany();

    const mappedData = rawResults.map((item: any) => {
      const anns = item.annotations || [];

      // Tìm bản ghi Human ACTIVE (Status KHÁC Deprecated) và mới nhất
      const humanAnn = anns
        .filter(
          (a) =>
            a.annotation_source === AnnotationSource.HUMAN &&
            a.annotation_status !== AnnotationStatus.DEPRECATED,
        )
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )[0];

      const aiAnn = anns.find(
        (a) => a.annotation_source === AnnotationSource.AI,
      );

      return {
        image_id: item.image_id,
        file_name: item.file_name,
        original_image_url: item.original_image_url,
        uploaded_by_name: item.uploader?.full_name || 'System',
        uploaded_at: item.uploaded_at,
        current_status: humanAnn ? humanAnn.annotation_status : 'UNLABELED',
        has_ai_reference: !!aiAnn,
        labeled_by_name: humanAnn?.labeler?.full_name,
        approved_by_name: humanAnn?.approver?.full_name,
      };
    });

    return {
      items: mappedData, // Return items để né Interceptor
      meta: {
        total_items: totalItems,
        current_page: page,
        items_per_page: limit,
        total_pages: Math.ceil(totalItems / limit),
      },
    };
  }

  // --- 3. GET DETAIL (WORKSPACE) ---
  async getResultImageDetail(image_id: string) {
    const item: any = await this.resultImageRepo
      .createQueryBuilder('img')
      .leftJoinAndMapOne(
        'img.uploader',
        StaffProfile,
        'uploader',
        'uploader.staff_id = img.uploaded_by',
      )
      .leftJoinAndMapMany(
        'img.annotations',
        ImageAnnotation,
        'ann',
        'ann.image_id = img.image_id',
      )
      .leftJoinAndMapOne(
        'ann.labeler',
        StaffProfile,
        'labeler',
        'labeler.staff_id = ann.labeled_by',
      )
      .leftJoinAndMapOne(
        'ann.approver',
        StaffProfile,
        'approver',
        'approver.staff_id = ann.approved_by',
      )
      .where('img.image_id = :id', { id: image_id })
      .orderBy('ann.created_at', 'DESC')
      .getOne();

    if (!item) return null;

    const aiAnn = item.annotations?.find(
      (a) => a.annotation_source === AnnotationSource.AI,
    );
    const humanAnns =
      item.annotations?.filter(
        (a) => a.annotation_source === AnnotationSource.HUMAN,
      ) || [];

    return {
      image_info: {
        image_id: item.image_id,
        original_image_url: item.original_image_url,
        file_name: item.file_name,
        uploaded_by_name: item.uploader?.full_name || 'System',
        uploaded_at: item.uploaded_at,
      },
      ai_reference: aiAnn
        ? { data: aiAnn.annotation_data, model: aiAnn.ai_model_name }
        : null,

      // Trả về danh sách history
      annotation_history: humanAnns.map((ann) => ({
        annotation_id: ann.annotation_id,
        annotation_data: ann.annotation_data,
        status: ann.annotation_status, // Enum: IN_PROGRESS, SUBMITTED, APPROVED, REJECTED, DEPRECATED
        rejection_reason: ann.rejection_reason,
        deprecation_reason: ann.deprecation_reason, // Lý do deprecated (nếu có)
        labeled_by_name: ann.labeler?.full_name,
        created_at: ann.created_at,
        approved_by_name: ann.approver?.full_name,
      })),
    };
  }
  // --- 4. UPSERT (LOGIC VERSIONING CỐT LÕI) - FIXED WITH PRIORITY ---
async upsertHumanAnnotation(image_id: string, dto: SaveHumanAnnotationDto) {
  // Tìm annotation HUMAN đang trong workflow (ưu tiên IN_PROGRESS, SUBMITTED)
  // Không lấy APPROVED hoặc REJECTED vì chúng là "concluded states"
  const workflowAnnotation = await this.imageAnnotationRepo.findOne({
    where: {
      image_id: image_id,
      annotation_source: AnnotationSource.HUMAN,
      annotation_status: In([AnnotationStatus.IN_PROGRESS, AnnotationStatus.SUBMITTED]),
    },
    order: { created_at: 'DESC' },
  });

  // CASE 1: Có annotation đang trong workflow (IN_PROGRESS hoặc SUBMITTED)
  // -> Update đè lên annotation đó
  if (workflowAnnotation) {
    workflowAnnotation.annotation_data = dto.annotation_data;
    workflowAnnotation.labeled_by = dto.labeled_by;
    workflowAnnotation.labeled_at = new Date();
    workflowAnnotation.annotation_status = AnnotationStatus.SUBMITTED;
    
    // Clear các thông tin cũ
    workflowAnnotation.approved_by = null;
    workflowAnnotation.approved_at = null;
    workflowAnnotation.rejection_reason = null;

    return await this.imageAnnotationRepo.save(workflowAnnotation);
  }

  // CASE 2: Không có annotation trong workflow
  // Kiểm tra xem có annotation APPROVED hoặc REJECTED không
  const concludedAnnotation = await this.imageAnnotationRepo.findOne({
    where: {
      image_id: image_id,
      annotation_source: AnnotationSource.HUMAN,
      annotation_status: In([AnnotationStatus.APPROVED, AnnotationStatus.REJECTED]),
    },
    order: { created_at: 'DESC' },
  });

  // CASE 2A: Có APPROVED -> Deprecate và tạo mới
  if (concludedAnnotation?.annotation_status === AnnotationStatus.APPROVED) {
    concludedAnnotation.annotation_status = AnnotationStatus.DEPRECATED;
    concludedAnnotation.deprecation_reason = "Đã chỉnh sửa và nộp phiên bản mới";
    await this.imageAnnotationRepo.save(concludedAnnotation);

    const newVersion = this.imageAnnotationRepo.create({
      image_id: image_id,
      annotation_source: AnnotationSource.HUMAN,
      annotation_data: dto.annotation_data,
      labeled_by: dto.labeled_by,
      annotation_status: AnnotationStatus.SUBMITTED,
      created_at: new Date(),
    });
    return await this.imageAnnotationRepo.save(newVersion);
  }

  // CASE 2B: Có REJECTED hoặc không có gì -> Tạo mới
  // (REJECTED giữ nguyên, không deprecate)
  const newAnnotation = this.imageAnnotationRepo.create({
    image_id: image_id,
    annotation_source: AnnotationSource.HUMAN,
    annotation_data: dto.annotation_data,
    labeled_by: dto.labeled_by,
    annotation_status: AnnotationStatus.SUBMITTED,
    created_at: new Date(),
  });
  return await this.imageAnnotationRepo.save(newAnnotation);
}
  // --- 5. APPROVE - Cũng cần sửa query ---
  async approveHumanAnnotation(image_id: string, dto: ApproveAnnotationDto) {
    // Chỉ approve annotation SUBMITTED (đang chờ duyệt)
    const annotation = await this.imageAnnotationRepo.findOne({
      where: {
        image_id: image_id,
        annotation_source: AnnotationSource.HUMAN,
        annotation_status: AnnotationStatus.SUBMITTED,
      },
      order: { created_at: 'DESC' },
    });

    if (!annotation) {
      throw new NotFoundException('Không tìm thấy bản ghi SUBMITTED để duyệt');
    }

    annotation.annotation_status = AnnotationStatus.APPROVED;
    annotation.approved_by = dto.approved_by;
    annotation.approved_at = new Date();
    annotation.rejection_reason = null;

    return await this.imageAnnotationRepo.save(annotation);
  }

  // --- 6. REJECT - Cũng cần sửa query ---
  async rejectAnnotation(imageId: string, dto: RejectAnnotationDto) {
    // Chỉ reject annotation SUBMITTED (đang chờ duyệt)
    const annotation = await this.imageAnnotationRepo.findOne({
      where: {
        image_id: imageId,
        annotation_source: AnnotationSource.HUMAN,
        annotation_status: AnnotationStatus.SUBMITTED,
      },
      order: { created_at: 'DESC' },
    });

    if (!annotation) {
      throw new NotFoundException(
        'Không tìm thấy bản ghi SUBMITTED để từ chối',
      );
    }

    annotation.annotation_status = AnnotationStatus.REJECTED;
    annotation.rejection_reason = dto.reason;
    annotation.reviewed_by = dto.rejected_by;
    annotation.reviewed_at = new Date();

    annotation.approved_by = null;
    annotation.approved_at = null;

    return await this.imageAnnotationRepo.save(annotation);
  }

  // --- 7. TOGGLE DEPRECATE (Manual) ---
  async toggleDeprecateAnnotation(annotationId: string, isDeprecated: boolean) {
    const annotation = await this.imageAnnotationRepo.findOne({
      where: { annotation_id: annotationId },
    });
    if (!annotation) throw new NotFoundException('Annotation not found');

    if (isDeprecated) {
      annotation.annotation_status = AnnotationStatus.DEPRECATED;
      annotation.deprecation_reason = 'Đánh dấu thủ công';
      return await this.imageAnnotationRepo.save(annotation);
    }

    // Logic Restore (Nếu cần): Clone data cũ thành bản ghi mới SUBMITTED
    const restoredVersion = this.imageAnnotationRepo.create({
      image_id: annotation.image_id,
      annotation_source: AnnotationSource.HUMAN,
      annotation_data: annotation.annotation_data,
      labeled_by: annotation.labeled_by,
      annotation_status: AnnotationStatus.SUBMITTED,
      created_at: new Date(),
    });
    return await this.imageAnnotationRepo.save(restoredVersion);
  }
}
