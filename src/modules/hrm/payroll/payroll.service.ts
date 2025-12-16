import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  HrPayroll,
  PayrollStatus,
} from '../../../database/entities/hr/hr_payroll.entity';
import {
  CreatePayrollDto,
  UpdatePayrollDto,
  QueryPayrollDto,
  CalculatePayrollDto,
} from './dto/payroll.dto';

@Injectable()
export class PayrollService {
  constructor(
    @InjectRepository(HrPayroll)
    private readonly payrollRepo: Repository<HrPayroll>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Tạo bảng lương (Draft)
   */
  async create(dto: CreatePayrollDto): Promise<HrPayroll> {
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

      // Check duplicate payroll_month
      const existing = await manager.findOne(HrPayroll, {
        where: {
          staff_id: dto.staff_id,
          payroll_month: new Date(dto.payroll_month),
        },
      });

      if (existing) {
        throw new ConflictException(
          'Payroll for this staff and month already exists',
        );
      }

      const payroll = manager.create(HrPayroll, {
        ...dto,
        status: PayrollStatus.DRAFT,
      });

      return await manager.save(payroll);
    });
  }

  /**
   * Tính lương tự động cho nhân viên trong tháng
   */
  async calculatePayroll(dto: CalculatePayrollDto): Promise<HrPayroll> {
    return await this.dataSource.transaction(async (manager) => {
      const { staff_id, year, month } = dto;

      // 1. Get salary config
      const salaryConfig = await manager
        .createQueryBuilder()
        .select('*')
        .from('hr_salary_config', 'sc')
        .where('sc.staff_id = :staff_id', { staff_id })
        .andWhere('sc.effective_date <= :date', {
          date: new Date(year, month - 1, 1),
        })
        .andWhere(
          '(sc.end_date IS NULL OR sc.end_date >= :date)',
          { date: new Date(year, month - 1, 1) },
        )
        .orderBy('sc.effective_date', 'DESC')
        .getRawOne();

      if (!salaryConfig) {
        throw new NotFoundException('No salary config found for this staff');
      }

      const baseSalary = parseFloat(salaryConfig.base_salary);
      const standardDays = salaryConfig.standard_days_per_month || 26;

      // 2. Calculate work days from attendance
      const attendanceStats = await manager.query(
        `
        SELECT 
          COUNT(CASE WHEN status = 'PRESENT' THEN 1 END) as present_days,
          COUNT(CASE WHEN status = 'LEAVE' THEN 1 END) as leave_days,
          SUM(overtime_minutes) as total_overtime_minutes
        FROM hr_time_attendance
        WHERE staff_id = $1
          AND EXTRACT(YEAR FROM work_date) = $2
          AND EXTRACT(MONTH FROM work_date) = $3
        `,
        [staff_id, year, month],
      );

      const workDays = parseFloat(attendanceStats[0]?.present_days || 0);
      const leaveDays = parseFloat(attendanceStats[0]?.leave_days || 0);
      const overtimeMinutes = parseInt(
        attendanceStats[0]?.total_overtime_minutes || 0,
      );
      const overtimeHours = overtimeMinutes / 60;

      // 3. Calculate actual salary
      const totalPaidDays = workDays + leaveDays;
      const actualSalary = (baseSalary / standardDays) * totalPaidDays;

      // 4. Calculate overtime salary (1.5x hourly rate)
      const hourlyRate = baseSalary / standardDays / 8;
      const overtimeSalary = hourlyRate * overtimeHours * 1.5;

      // 5. Get allowances
      const allowances = await manager.query(
        `
        SELECT SUM(CAST(amount AS DECIMAL)) as total
        FROM hr_allowances
        WHERE (
          (target_type = 'INDIVIDUAL' AND staff_id = $1)
          OR (target_type = 'GROUP' AND role_id = (
            SELECT role_id FROM staff_profiles WHERE staff_id = $1
          ))
        )
        AND start_date <= $2
        AND (end_date IS NULL OR end_date >= $2)
        `,
        [staff_id, new Date(year, month - 1, 1)],
      );

      const totalAllowances = parseFloat(allowances[0]?.total || 0);

      // 6. Calculate net salary
      const netSalary =
        actualSalary + overtimeSalary + totalAllowances;

      // 7. Check if payroll exists
      const payrollMonth = new Date(year, month - 1, 1);
      let payroll = await manager.findOne(HrPayroll, {
        where: { staff_id, payroll_month: payrollMonth },
      });

      if (payroll) {
        // Update existing
        if (payroll.status === PayrollStatus.PAID) {
          throw new BadRequestException('Cannot update paid payroll');
        }

        Object.assign(payroll, {
          work_days: workDays.toFixed(2),
          leave_days: leaveDays.toFixed(2),
          total_paid_days: totalPaidDays.toFixed(2),
          overtime_hours: overtimeHours.toFixed(2),
          base_salary: baseSalary.toFixed(2),
          actual_salary: actualSalary.toFixed(2),
          overtime_salary: overtimeSalary.toFixed(2),
          total_allowances: totalAllowances.toFixed(2),
          net_salary: netSalary.toFixed(2),
          status: PayrollStatus.CALCULATED,
        });
      } else {
        // Create new
        payroll = manager.create(HrPayroll, {
          staff_id,
          payroll_month: payrollMonth,
          work_days: workDays.toFixed(2),
          leave_days: leaveDays.toFixed(2),
          total_paid_days: totalPaidDays.toFixed(2),
          overtime_hours: overtimeHours.toFixed(2),
          base_salary: baseSalary.toFixed(2),
          actual_salary: actualSalary.toFixed(2),
          overtime_salary: overtimeSalary.toFixed(2),
          total_allowances: totalAllowances.toFixed(2),
          total_bonus: '0',
          total_penalty: '0',
          net_salary: netSalary.toFixed(2),
          status: PayrollStatus.CALCULATED,
        });
      }

      return await manager.save(payroll);
    });
  }

  /**
   * Lấy danh sách bảng lương
   */
  async findAll(query: QueryPayrollDto) {
    const {
      page = 1,
      limit = 20,
      staff_id,
      status,
      year,
      month,
    } = query;
    const skip = (page - 1) * limit;

    const qb = this.payrollRepo
      .createQueryBuilder('payroll')
      .leftJoinAndSelect('payroll.staff', 'staff')
      .leftJoinAndSelect('payroll.approver', 'approver');

    if (staff_id) {
      qb.andWhere('payroll.staff_id = :staff_id', { staff_id });
    }

    if (status) {
      qb.andWhere('payroll.status = :status', { status });
    }

    if (year) {
      qb.andWhere('EXTRACT(YEAR FROM payroll.payroll_month) = :year', {
        year,
      });
    }

    if (month) {
      qb.andWhere('EXTRACT(MONTH FROM payroll.payroll_month) = :month', {
        month,
      });
    }

    qb.orderBy('payroll.payroll_month', 'DESC');
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
   * Lấy chi tiết bảng lương
   */
  async findOne(id: string): Promise<HrPayroll> {
    const payroll = await this.payrollRepo.findOne({
      where: { payroll_id: id },
      relations: ['staff', 'approver'],
    });

    if (!payroll) {
      throw new NotFoundException(`Payroll ${id} not found`);
    }

    return payroll;
  }

  /**
   * Cập nhật bảng lương
   */
  async update(id: string, dto: UpdatePayrollDto): Promise<HrPayroll> {
    const payroll = await this.findOne(id);

    if (payroll.status === PayrollStatus.PAID) {
      throw new BadRequestException('Cannot update paid payroll');
    }

    Object.assign(payroll, dto);

    // Recalculate net salary if any component changed
    if (
      dto.actual_salary ||
      dto.overtime_salary ||
      dto.total_allowances ||
      dto.total_bonus ||
      dto.total_penalty
    ) {
      const netSalary =
        parseFloat(payroll.actual_salary) +
        parseFloat(payroll.overtime_salary) +
        parseFloat(payroll.total_allowances) +
        parseFloat(payroll.total_bonus) -
        parseFloat(payroll.total_penalty);

      payroll.net_salary = netSalary.toFixed(2);
    }

    return await this.payrollRepo.save(payroll);
  }

  /**
   * Phê duyệt bảng lương
   */
  async approve(id: string, approverId: string): Promise<HrPayroll> {
    const payroll = await this.findOne(id);

    if (payroll.status !== PayrollStatus.CALCULATED) {
      throw new BadRequestException(
        'Only CALCULATED payroll can be approved',
      );
    }

    payroll.status = PayrollStatus.APPROVED;
    payroll.approved_by = approverId;

    return await this.payrollRepo.save(payroll);
  }

  /**
   * Đánh dấu đã trả lương
   */
  async markAsPaid(id: string): Promise<HrPayroll> {
    const payroll = await this.findOne(id);

    if (payroll.status !== PayrollStatus.APPROVED) {
      throw new BadRequestException('Only APPROVED payroll can be marked as paid');
    }

    payroll.status = PayrollStatus.PAID;
    payroll.paid_at = new Date();

    return await this.payrollRepo.save(payroll);
  }

  /**
   * Xóa bảng lương (chỉ cho phép DRAFT/CALCULATED)
   */
  async remove(id: string): Promise<void> {
    const payroll = await this.findOne(id);

    if (
      ![PayrollStatus.DRAFT, PayrollStatus.CALCULATED].includes(payroll.status)
    ) {
      throw new BadRequestException(
        'Can only delete DRAFT or CALCULATED payroll',
      );
    }

    await this.payrollRepo.delete(id);
  }
}