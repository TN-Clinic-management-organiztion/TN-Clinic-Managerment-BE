import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  HrLeaveRequest,
  LeaveRequestStatus,
} from '../../../database/entities/hr/hr_leave_requests.entity';
import {
  CreateLeaveDto,
  UpdateLeaveDto,
  QueryLeaveDto,
  ApproveLeaveDto,
} from './dto/leave.dto';

@Injectable()
export class LeavesService {
  constructor(
    @InjectRepository(HrLeaveRequest)
    private readonly leaveRepo: Repository<HrLeaveRequest>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Tạo đơn xin nghỉ
   */
  async create(dto: CreateLeaveDto): Promise<HrLeaveRequest> {
    // Validate staff exists
    const staffExists = await this.dataSource.manager
      .createQueryBuilder()
      .select('1')
      .from('staff_profiles', 's')
      .where('s.staff_id = :id', { id: dto.staff_id })
      .andWhere('s.deleted_at IS NULL')
      .getRawOne();

    if (!staffExists) {
      throw new NotFoundException('Staff not found');
    }

    // Validate dates
    const startDate = new Date(dto.start_date);
    const endDate = new Date(dto.end_date);

    if (startDate > endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    // Calculate total days (simple calculation)
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const leave = this.leaveRepo.create({
      ...dto,
      total_days: diffDays.toString(),
      status: LeaveRequestStatus.PENDING,
    });

    return await this.leaveRepo.save(leave);
  }

  /**
   * Lấy danh sách đơn xin nghỉ
   */
  async findAll(query: QueryLeaveDto) {
    const {
      page = 1,
      limit = 20,
      staff_id,
      status,
      leave_type,
      from_date,
      to_date,
    } = query;
    const skip = (page - 1) * limit;

    const qb = this.leaveRepo
      .createQueryBuilder('leave')
      .leftJoinAndSelect('leave.staff', 'staff')
      .leftJoinAndSelect('leave.approver', 'approver');

    if (staff_id) {
      qb.andWhere('leave.staff_id = :staff_id', { staff_id });
    }

    if (status) {
      qb.andWhere('leave.status = :status', { status });
    }

    if (leave_type) {
      qb.andWhere('leave.leave_type = :leave_type', { leave_type });
    }

    if (from_date) {
      qb.andWhere('leave.start_date >= :from_date', {
        from_date: new Date(from_date),
      });
    }

    if (to_date) {
      qb.andWhere('leave.end_date <= :to_date', {
        to_date: new Date(to_date),
      });
    }

    qb.orderBy('leave.created_at', 'DESC');
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
   * Lấy chi tiết đơn xin nghỉ
   */
  async findOne(id: string): Promise<HrLeaveRequest> {
    const leave = await this.leaveRepo.findOne({
      where: { request_id: id },
      relations: ['staff', 'approver'],
    });

    if (!leave) {
      throw new NotFoundException(`Leave request ${id} not found`);
    }

    return leave;
  }

  /**
   * Cập nhật đơn xin nghỉ (chỉ cho phép khi PENDING)
   */
  async update(id: string, dto: UpdateLeaveDto): Promise<HrLeaveRequest> {
    const leave = await this.findOne(id);

    if (leave.status !== LeaveRequestStatus.PENDING) {
      throw new BadRequestException(
        `Cannot update leave request with status ${leave.status}`,
      );
    }

    Object.assign(leave, dto);

    // Recalculate total_days if dates changed
    if (dto.start_date || dto.end_date) {
      const startDate = new Date(dto.start_date || leave.start_date);
      const endDate = new Date(dto.end_date || leave.end_date);
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      leave.total_days = diffDays.toString();
    }

    return await this.leaveRepo.save(leave);
  }

  /**
   * Phê duyệt/Từ chối đơn xin nghỉ
   */
  async approve(id: string, dto: ApproveLeaveDto): Promise<HrLeaveRequest> {
    const leave = await this.findOne(id);

    if (leave.status !== LeaveRequestStatus.PENDING) {
      throw new BadRequestException(
        `Cannot approve leave request with status ${leave.status}`,
      );
    }

    leave.status = dto.status;
    leave.decision_by = dto.approver_id;
    leave.decision_at = new Date();

    // Chỗ này cần lưu ý, là khi được duyệt thì sẽ tạo 1 record cho bảng attendance (Hiện tại chưa có)

    return await this.leaveRepo.save(leave);
  }

  /**
   * Xóa đơn xin nghỉ (chỉ cho phép khi PENDING)
   */
  async remove(id: string): Promise<void> {
    const leave = await this.findOne(id);

    if (leave.status !== LeaveRequestStatus.PENDING) {
      throw new BadRequestException(
        `Cannot delete leave request with status ${leave.status}`,
      );
    }

    await this.leaveRepo.delete(id);
  }

  /**
   * Thống kê nghỉ phép theo nhân viên
   */
  async getLeaveStatsByStaff(staffId: string, year: number) {
    const result = await this.dataSource.query(
      `
      SELECT 
        leave_type,
        COUNT(*) as request_count,
        SUM(CAST(total_days AS DECIMAL)) as total_days
      FROM hr_leave_requests
      WHERE staff_id = $1
        AND status = 'APPROVED'
        AND EXTRACT(YEAR FROM start_date) = $2
      GROUP BY leave_type
      `,
      [staffId, year],
    );

    return result;
  }
}