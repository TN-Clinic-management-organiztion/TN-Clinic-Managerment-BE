import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceResult } from 'src/database/entities/service/service_results.entity';
import { ResultImage } from 'src/database/entities/service/result_images.entity';
import { ResultDetailNumeric } from 'src/database/entities/service/result_details_numeric.entity';
import { Repository } from 'typeorm';
import { CreateResultImageDto } from 'src/modules/paraclinical/results/dto/result_images/create-result-image.dto';

@Injectable()
export class ResultsService {
  constructor(
    @InjectRepository(ServiceResult)
    private serviceResultRepository: Repository<ServiceResult>,
    @InjectRepository(ResultImage)
    private resultImageRepository: Repository<ResultImage>,
    @InjectRepository(ResultDetailNumeric)
    private resultDetailNumeric: Repository<ResultDetailNumeric>,
  ) {}

  async createResultImage(dto: CreateResultImageDto) {
    try {
      const newImage = this.resultImageRepository.create({
        result_id: dto.result_id,
        original_image_url: dto.original_image_url,
        public_id: dto.public_id || null,
        file_name: dto.file_name,
        file_size: dto.file_size,
        mime_type: dto.mime_type,
        uploaded_by: dto.uploaded_by,
      });

      return await this.resultImageRepository.save(newImage);
    } catch (error) {
      throw error;
    }
  }
}
