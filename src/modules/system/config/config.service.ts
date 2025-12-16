import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemConfig } from '../../../database/entities/system/system_config.entity';
import {
  CreateConfigDto,
  UpdateConfigDto,
  QueryConfigDto,
} from './dto/config.dto';

@Injectable()
export class ConfigService {
  constructor(
    @InjectRepository(SystemConfig)
    private readonly configRepo: Repository<SystemConfig>,
  ) {}

  /**
   * Tạo cấu hình mới
   */
  async create(dto: CreateConfigDto): Promise<SystemConfig> {
    // Check duplicate config_key
    const existing = await this.configRepo.findOne({
      where: { config_key: dto.config_key },
    });

    if (existing) {
      throw new ConflictException(
        `Config key '${dto.config_key}' already exists`,
      );
    }

    const config = this.configRepo.create(dto);
    return await this.configRepo.save(config);
  }

  /**
   * Lấy danh sách cấu hình
   */
  async findAll(query: QueryConfigDto) {
    const { page = 1, limit = 20, config_type, search } = query;
    const skip = (page - 1) * limit;

    const qb = this.configRepo
      .createQueryBuilder('config')
      .leftJoinAndSelect('config.updater', 'updater');

    if (config_type) {
      qb.andWhere('config.config_type = :config_type', { config_type });
    }

    if (search) {
      qb.andWhere(
        '(config.config_key ILIKE :search OR config.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    qb.orderBy('config.config_key', 'ASC');
    qb.skip(skip).take(limit);

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

  /**
   * Lấy cấu hình theo key
   */
  async findByKey(key: string): Promise<SystemConfig> {
    const config = await this.configRepo.findOne({
      where: { config_key: key },
    });

    if (!config) {
      throw new NotFoundException(`Config key '${key}' not found`);
    }

    return config;
  }

  /**
   * Lấy giá trị cấu hình (chỉ trả về value)
   */
  async getValue(key: string): Promise<string> {
    const config = await this.findByKey(key);
    return config.config_value;
  }

  /**
   * Cập nhật cấu hình
   */
  async update(key: string, dto: UpdateConfigDto): Promise<SystemConfig> {
    const config = await this.findByKey(key);

    Object.assign(config, dto);

    return await this.configRepo.save(config);
  }

  /**
   * Xóa cấu hình
   */
  async remove(key: string): Promise<void> {
    const result = await this.configRepo.delete({ config_key: key });

    if (result.affected === 0) {
      throw new NotFoundException(`Config key '${key}' not found`);
    }
  }

  /**
   * Lấy nhiều cấu hình theo type
   */
  async findByType(type: string): Promise<SystemConfig[]> {
    return await this.configRepo.find({
      where: { config_type: type },
      order: { config_key: 'ASC' },
    });
  }
}