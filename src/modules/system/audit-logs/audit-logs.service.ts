import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemAuditLog } from '../../../database/entities/system/system_audit_logs.entity';
import { CreateAuditLogDto, QueryAuditLogDto } from './dto/audit-log.dto';

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(SystemAuditLog)
    private readonly auditLogRepo: Repository<SystemAuditLog>,
  ) {}

  /**
   * Tạo audit log
   */
  async create(dto: CreateAuditLogDto): Promise<SystemAuditLog> {
    const log = this.auditLogRepo.create(dto);
    return await this.auditLogRepo.save(log);
  }

  /**
   * Lấy danh sách audit logs
   */
  async findAll(query: QueryAuditLogDto) {
    const {
      page = 1,
      limit = 20,
      user_id,
      action_type,
      table_name,
      from_date,
      to_date,
    } = query;
    const skip = (page - 1) * limit;

    const qb = this.auditLogRepo.createQueryBuilder('log');

    if (user_id) {
      qb.andWhere('log.user_id = :user_id', { user_id });
    }

    if (action_type) {
      qb.andWhere('log.action_type = :action_type', { action_type });
    }

    if (table_name) {
      qb.andWhere('log.table_name = :table_name', { table_name });
    }

    if (from_date) {
      qb.andWhere('log.created_at >= :from_date', {
        from_date: new Date(from_date),
      });
    }

    if (to_date) {
      qb.andWhere('log.created_at <= :to_date', {
        to_date: new Date(to_date),
      });
    }

    qb.orderBy('log.created_at', 'DESC');
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
   * Lấy chi tiết audit log
   */
  async findOne(id: string): Promise<SystemAuditLog> {
    const log = await this.auditLogRepo.findOne({
      where: { log_id: id },
    });

    if (!log) {
      throw new NotFoundException(`Audit log ${id} not found`);
    }

    return log;
  }

  /**
   * Lấy lịch sử thay đổi của một record
   */
  async findByRecord(tableName: string, recordId: string) {
    return await this.auditLogRepo.find({
      where: {
        table_name: tableName,
        record_id: recordId,
      },
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Lấy thống kê hoạt động theo user
   */
  async getUserActivityStats(userId: string, fromDate: Date, toDate: Date) {
    const result = await this.auditLogRepo
      .createQueryBuilder('log')
      .select('log.action_type', 'action_type')
      .addSelect('COUNT(*)', 'count')
      .where('log.user_id = :userId', { userId })
      .andWhere('log.created_at >= :fromDate', { fromDate })
      .andWhere('log.created_at <= :toDate', { toDate })
      .groupBy('log.action_type')
      .getRawMany();

    return result;
  }
}