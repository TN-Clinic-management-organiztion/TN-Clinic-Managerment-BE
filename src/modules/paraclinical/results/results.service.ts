import {
  BadRequestException,
  HttpCode,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceResult } from 'src/database/entities/service/service_results.entity';
import { ResultImage } from 'src/database/entities/service/result_images.entity';
import { ResultDetailNumeric } from 'src/database/entities/service/result_details_numeric.entity';
import { Repository } from 'typeorm';
import { CreateResultImageDto } from 'src/modules/paraclinical/results/dto/result_images/create-result-image.dto';
import { CloudinaryService } from 'src/shared/cloudinary/cloudinary.service';

@Injectable()
export class ResultsService {
  constructor(
    @InjectRepository(ServiceResult)
    private serviceResultRepository: Repository<ServiceResult>,
    @InjectRepository(ResultImage)
    private resultImageRepository: Repository<ResultImage>,
    @InjectRepository(ResultDetailNumeric)
    private resultDetailNumeric: Repository<ResultDetailNumeric>,

    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async createResultImage(dto: CreateResultImageDto) {
    console.log('dto: ', dto);
    try {
      const newImage = this.resultImageRepository.create({
        result_id: dto.result_id || null,
        original_image_url: dto.original_image_url,
        public_id: dto.public_id,
        file_name: dto.file_name,
        file_size: dto.file_size ? String(dto.file_size) : undefined,
        mime_type: dto.mime_type,
        uploaded_by: dto.uploaded_by,
      });

      const savedImage = await this.resultImageRepository.save(newImage);

      return {
        message: 'Upload ảnh thành công',
        data: savedImage,
      };
    } catch (error) {
      throw error;
    }
  }

  async createResultImageCloundinary(
    file: Express.Multer.File,
    dto: CreateResultImageDto,
  ) {
    try {
      if (!file) {
        throw new BadRequestException('Vui lòng chọn file ảnh để up');
      }

      const cloudImage = await this.cloudinaryService.uploadMedicalImage(file);

      const newImage = await this.resultImageRepository.create({
        result_id: dto.result_id || null,
        uploaded_by: dto.uploaded_by,
        // Cloundinary
        original_image_url: String(cloudImage.secure_url),
        public_id: cloudImage.public_id,
        file_name: file.originalname,
        file_size: String(file.size),
        mime_type: file.mimetype,
      });

      const savedImage = await this.resultImageRepository.save(newImage);

      return {
        message: 'Upload và lưu ảnh thành công',
        data: savedImage,
      };
    } catch (error) {
      console.error('Error in createResultImage:', error);
      if (error instanceof BadRequestException) throw error;

      // Check lỗi FK
      if (error.code === '23503') {
        throw new BadRequestException(
          'Nhân viên hoặc Kết quả khám không tồn tại.',
        );
      }
      throw new InternalServerErrorException('Lỗi hệ thống khi xử lý ảnh.');
    }
  }
}
