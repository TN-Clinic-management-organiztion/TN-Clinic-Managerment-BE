import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { HrSalaryConfig } from '../../../database/entities/hr/hr_salary_config.entity';
import {
  CreateSalaryConfigDto,
  UpdateSalaryConfigDto,
  QuerySalaryConfigDto,
} from './dto/salary-config.dto';

@Injectable()
export class SalaryConfigService {
  constructor(
    @InjectRepository(HrSalaryConfig)
    private readonly salaryConfigRepo: Repository<HrSalaryConfig>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Tạo cấu hình lương mới
   */
  async create(dto: CreateSalaryConfigDto): Promise<HrSalaryConfig> {
    return await this.dataSource.transaction(async (manager) => {
      // Validate staff exists
      const staffExists = await manager
        .createQueryBuilder()
        .select('1')
        .from('staff_profiles', 's')
        .where('s.staff_id = :id', { id: dto.staff_id })
        .andWhere('s.deleted_at IS NULL')
        .getRawOne();

      if (!staffExists) {
        throw new NotFoundException('Staff not found');
      }

      // Check duplicate effective_date
      const existing = await manager.findOne(HrSalaryConfig, {
        where: {
          staff_id: dto.staff_id,
          effective_date: new Date(dto.effective_date),
        },
      });

      if (existing) {
        throw new ConflictException(
          'Salary config for this staff and effective date already exists',
        );
      }

      // End previous configs if this is a new effective date
      await manager
        .createQueryBuilder()
        .update(HrSalaryConfig)
        .set({ end_date: new Date(dto.effective_date) })
        .where('staff_id = :staff_id', { staff_id: dto.staff_id })
        .andWhere('end_date IS NULL')
        .andWhere('effective_date < :effective_date', {
          effective_date: new Date(dto.effective_date),
        })
        .execute();

      const config = manager.create(HrSalaryConfig, dto);

      return await manager.save(config);
    });
  }

  /**
   * Lấy danh sách cấu hình lương
   */
  async findAll(query: QuerySalaryConfigDto) {
    const { page = 1, limit = 20, staff_id, active_only } = query;
    const skip = (page - 1) * limit;

    const qb = this.salaryConfigRepo
      .createQueryBuilder('config')
      .leftJoinAndSelect('config.staff', 'staff');

    if (staff_id) {
      qb.andWhere('config.staff_id = :staff_id', { staff_id });
    }

    if (active_only) {
      const today = new Date();
      qb.andWhere('config.effective_date <= :today', { today });
      qb.andWhere(
        '(config.end_date IS NULL OR config.end_date >= :today)',
        { today },
      );
    }

    qb.orderBy('config.effective_date', 'DESC');
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
   * Lấy cấu hình lương hiện tại của nhân viên
   */
  async getCurrentConfig(staffId: string): Promise<HrSalaryConfig | null> {
    const today = new Date();

    const config = await this.salaryConfigRepo
      .createQueryBuilder('config')
      .leftJoinAndSelect('config.staff', 'staff')
      .where('config.staff_id = :staffId', { staffId })
      .andWhere('config.effective_date <= :today', { today })
      .andWhere('(config.end_date IS NULL OR config.end_date >= :today)', {
        today,
      })
      .orderBy('config.effective_date', 'DESC')
      .getOne();

    return config;
  }

  /**
   * Lấy chi tiết cấu hình lương
   */
  async findOne(id: number): Promise<HrSalaryConfig> {
    const config = await this.salaryConfigRepo.findOne({
      where: { config_id: id },
      relations: ['staff'],
    });

    if (!config) {
      throw new NotFoundException(`Salary config ${id} not found`);
    }

    return config;
  }

  /**
   * Cập nhật cấu hình lương
   */
  async update(
    id: number,
    dto: UpdateSalaryConfigDto,
  ): Promise<HrSalaryConfig> {
    const config = await this.findOne(id);

    Object.assign(config, dto);

    return await this.salaryConfigRepo.save(config);
  }

  /**
   * Xóa cấu hình lương
   */
  async remove(id: number): Promise<void> {
    const result = await this.salaryConfigRepo.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Salary config ${id} not found`);
    }
  }
}