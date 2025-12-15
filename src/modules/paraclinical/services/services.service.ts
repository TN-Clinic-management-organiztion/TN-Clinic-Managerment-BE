import { CreateServiceDto } from './dto/services/create-service.dto';
import { UpdateServiceDto } from './dto/services/update-service.dto';
import { QueryServiceDto } from './dto/services/query-service.dto';
import { CreateCategoryDto } from './dto/categories/create-category.dto';
import { UpdateCategoryDto } from './dto/categories/update-category.dto';
import { QueryCategoryDto } from './dto/categories/query-category.dto';
import { CreateIndicatorDto } from './dto/indicators/create-indicator.dto';
import { UpdateIndicatorDto } from './dto/indicators/update-indicator.dto';
import { QueryIndicatorDto } from './dto/indicators/query-indicator.dto';
import { LinkServiceIndicatorDto } from './dto/service-indicators/link-indicator.dto';
import { LinkRoomServiceDto } from './dto/service-indicators/link-room-service.dto';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { RefService } from 'src/database/entities/service/ref_services.entity';
import { RefServiceCategory } from 'src/database/entities/service/ref_service_categories.entity';
import { RefLabIndicator } from 'src/database/entities/service/ref_lab_indicators.entity';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(RefService)
    private serviceRepo: Repository<RefService>,
    @InjectRepository(RefServiceCategory)
    private categoryRepo: Repository<RefServiceCategory>,
    @InjectRepository(RefLabIndicator)
    private indicatorRepo: Repository<RefLabIndicator>,
    private dataSource: DataSource,
  ) {}

  // ==================== SERVICES ====================
  async createService(dto: CreateServiceDto): Promise<RefService> {
    const service = this.serviceRepo.create({
      ...dto,
      base_price: dto.base_price ? String(dto.base_price) : undefined,
    });
    return await this.serviceRepo.save(service);
  }

  async findAllServices(query: QueryServiceDto) {
    const {
      page = 1,
      limit = 20,
      category_id,
      result_input_type,
      search,
    } = query;

    const skip = (page - 1) * limit;
    const qb = this.serviceRepo
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.category', 'category');

    if (category_id) {
      qb.andWhere('service.category_id = :category_id', { category_id });
    }

    if (result_input_type) {
      qb.andWhere('service.result_input_type = :result_input_type', {
        result_input_type,
      });
    }

    if (search) {
      qb.andWhere('service.service_name ILIKE :search', {
        search: `%${search}%`,
      });
    }

    qb.orderBy('service.service_id', 'DESC').skip(skip).take(limit);

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

  async findOneService(id: number): Promise<RefService> {
    const service = await this.serviceRepo.findOne({
      where: { service_id: id },
      relations: ['category'],
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    return service;
  }

  async updateService(id: number, dto: UpdateServiceDto): Promise<RefService> {
    const service = await this.findOneService(id);
    Object.assign(service, {
      ...dto,
      base_price: dto.base_price ? String(dto.base_price) : service.base_price,
    });
    return await this.serviceRepo.save(service);
  }

  async removeService(id: number): Promise<void> {
    const service = await this.findOneService(id);
    await this.serviceRepo.remove(service);
  }

  // ==================== CATEGORIES ====================
  async createCategory(dto: CreateCategoryDto): Promise<RefServiceCategory> {
    const category = this.categoryRepo.create(dto);
    return await this.categoryRepo.save(category);
  }

  async findAllCategories(query: QueryCategoryDto) {
    const { page = 1, limit = 20, parent_id, is_system_root, search } = query;

    const skip = (page - 1) * limit;
    const qb = this.categoryRepo
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.parent', 'parent');

    if (parent_id !== undefined) {
      if (parent_id === null) {
        qb.andWhere('category.parent_id IS NULL');
      } else {
        qb.andWhere('category.parent_id = :parent_id', { parent_id });
      }
    }

    if (is_system_root !== undefined) {
      qb.andWhere('category.is_system_root = :is_system_root', {
        is_system_root,
      });
    }

    if (search) {
      qb.andWhere('category.category_name ILIKE :search', {
        search: `%${search}%`,
      });
    }

    qb.orderBy('category.category_id', 'ASC').skip(skip).take(limit);

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

  async findOneCategory(id: number): Promise<RefServiceCategory> {
    const category = await this.categoryRepo.findOne({
      where: { category_id: id },
      relations: ['parent'],
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async getCategoryTree(): Promise<any[]> {
    const categories = await this.categoryRepo.find({
      relations: ['parent'],
      order: { category_id: 'ASC' },
    });

    const categoryMap = new Map();
    const tree: any[] = [];

    // Create map of all categories
    categories.forEach((cat) => {
      categoryMap.set(cat.category_id, { ...cat, children: [] });
    });

    // Build tree structure
    categories.forEach((cat) => {
      const node = categoryMap.get(cat.category_id);
      if (cat.parent_id) {
        const parent = categoryMap.get(cat.parent_id);
        if (parent) {
          parent.children.push(node);
        }
      } else {
        tree.push(node);
      }
    });

    return tree;
  }

  async updateCategory(
    id: number,
    dto: UpdateCategoryDto,
  ): Promise<RefServiceCategory> {
    const category = await this.findOneCategory(id);
    Object.assign(category, dto);
    return await this.categoryRepo.save(category);
  }

  async removeCategory(id: number): Promise<void> {
    const category = await this.findOneCategory(id);

    // Check if category has children
    const hasChildren = await this.categoryRepo.count({
      where: { parent_id: id },
    });

    if (hasChildren > 0) {
      throw new BadRequestException(
        'Cannot delete category with child categories',
      );
    }

    // Check if category has services
    const hasServices = await this.serviceRepo.count({
      where: { category_id: id },
    });

    if (hasServices > 0) {
      throw new BadRequestException('Cannot delete category with services');
    }

    await this.categoryRepo.remove(category);
  }

  // ==================== INDICATORS ====================
  async createIndicator(dto: CreateIndicatorDto): Promise<RefLabIndicator> {
    const indicator = this.indicatorRepo.create({
      ...dto,
      ref_min_male: dto.ref_min_male ? String(dto.ref_min_male) : undefined,
      ref_max_male: dto.ref_max_male ? String(dto.ref_max_male) : undefined,
      ref_min_female: dto.ref_min_female
        ? String(dto.ref_min_female)
        : undefined,
      ref_max_female: dto.ref_max_female
        ? String(dto.ref_max_female)
        : undefined,
    });
    return await this.indicatorRepo.save(indicator);
  }

  async findAllIndicators(query: QueryIndicatorDto) {
    const { page = 1, limit = 20, indicator_code, search } = query;

    const skip = (page - 1) * limit;
    const qb = this.indicatorRepo.createQueryBuilder('indicator');

    if (indicator_code) {
      qb.andWhere('indicator.indicator_code = :indicator_code', {
        indicator_code,
      });
    }

    if (search) {
      qb.andWhere(
        '(indicator.indicator_name ILIKE :search OR indicator.indicator_code ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    qb.orderBy('indicator.indicator_id', 'ASC').skip(skip).take(limit);

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

  async findOneIndicator(id: number): Promise<RefLabIndicator> {
    const indicator = await this.indicatorRepo.findOne({
      where: { indicator_id: id },
    });

    if (!indicator) {
      throw new NotFoundException(`Indicator with ID ${id} not found`);
    }

    return indicator;
  }

  async updateIndicator(
    id: number,
    dto: UpdateIndicatorDto,
  ): Promise<RefLabIndicator> {
    const indicator = await this.findOneIndicator(id);
    Object.assign(indicator, {
      ...dto,
      ref_min_male: dto.ref_min_male
        ? String(dto.ref_min_male)
        : indicator.ref_min_male,
      ref_max_male: dto.ref_max_male
        ? String(dto.ref_max_male)
        : indicator.ref_max_male,
      ref_min_female: dto.ref_min_female
        ? String(dto.ref_min_female)
        : indicator.ref_min_female,
      ref_max_female: dto.ref_max_female
        ? String(dto.ref_max_female)
        : indicator.ref_max_female,
    });
    return await this.indicatorRepo.save(indicator);
  }

  async removeIndicator(id: number): Promise<void> {
    const indicator = await this.findOneIndicator(id);
    await this.indicatorRepo.remove(indicator);
  }

  // ==================== SERVICE-INDICATOR LINKS ====================
  async linkServiceIndicator(dto: LinkServiceIndicatorDto): Promise<void> {
    const { service_id, indicator_id, sort_order } = dto;

    // Verify service exists
    await this.findOneService(service_id);

    // Verify indicator exists
    await this.findOneIndicator(indicator_id);

    // Insert link
    await this.dataSource.query(
      `INSERT INTO rel_service_indicators (service_id, indicator_id, sort_order)
       VALUES ($1, $2, $3)
       ON CONFLICT (service_id, indicator_id) DO UPDATE SET sort_order = $3`,
      [service_id, indicator_id, sort_order || null],
    );
  }

  async unlinkServiceIndicator(
    serviceId: number,
    indicatorId: number,
  ): Promise<void> {
    await this.dataSource.query(
      `DELETE FROM rel_service_indicators 
       WHERE service_id = $1 AND indicator_id = $2`,
      [serviceId, indicatorId],
    );
  }

  async getServiceIndicators(serviceId: number) {
    const indicators = await this.dataSource.query(
      `SELECT i.*, rsi.sort_order
       FROM ref_lab_indicators i
       JOIN rel_service_indicators rsi ON i.indicator_id = rsi.indicator_id
       WHERE rsi.service_id = $1
       ORDER BY rsi.sort_order NULLS LAST, i.indicator_id`,
      [serviceId],
    );

    return indicators;
  }

  // ==================== ROOM-SERVICE LINKS ====================
  async linkRoomService(dto: LinkRoomServiceDto): Promise<void> {
    const { room_id, service_id } = dto;

    // Verify room exists
    const roomExists = await this.dataSource.query(
      `SELECT 1 FROM org_rooms WHERE room_id = $1 AND is_active = true`,
      [room_id],
    );

    if (!roomExists.length) {
      throw new NotFoundException(`Room with ID ${room_id} not found`);
    }

    // Verify service exists
    await this.findOneService(service_id);

    // Insert link
    await this.dataSource.query(
      `INSERT INTO room_services (room_id, service_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [room_id, service_id],
    );
  }

  async unlinkRoomService(roomId: number, serviceId: number): Promise<void> {
    await this.dataSource.query(
      `DELETE FROM room_services 
       WHERE room_id = $1 AND service_id = $2`,
      [roomId, serviceId],
    );
  }

  async getRoomServices(roomId: number) {
    const services = await this.dataSource.query(
      `SELECT s.*, c.category_name
       FROM ref_services s
       LEFT JOIN ref_service_categories c ON s.category_id = c.category_id
       JOIN room_services rs ON s.service_id = rs.service_id
       WHERE rs.room_id = $1
       ORDER BY s.service_id`,
      [roomId],
    );

    return services;
  }

  async getServiceRooms(serviceId: number) {
    const rooms = await this.dataSource.query(
      `SELECT r.*
       FROM org_rooms r
       JOIN room_services rs ON r.room_id = rs.room_id
       WHERE rs.service_id = $1 AND r.is_active = true
       ORDER BY r.room_id`,
      [serviceId],
    );

    return rooms;
  }
}