import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  HrTimeAttendance,
  AttendanceStatus,
} from '../../../database/entities/hr/hr_time_attendance.entity';
import {
  CheckInDto,
  CheckOutDto,
  QueryAttendanceDto,
  UpdateAttendanceDto,
} from './dto/attendance.dto';
import { HrShift } from 'src/database/entities/hr/hr_shifts.entity';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(HrTimeAttendance)
    private readonly attendanceRepo: Repository<HrTimeAttendance>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Check-in
   */
  async checkIn(dto: CheckInDto): Promise<HrTimeAttendance> {
    return await this.dataSource.transaction(async (manager) => {
      // Check if already checked in today
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const existing = await manager.findOne(HrTimeAttendance, {
        where: {
          staff_id: dto.staff_id,
          work_date: today,
        },
      });

      if (existing) {
        throw new ConflictException('Already checked in today');
      }

      // Get shift info if provided
      let shift: HrShift | null = null;
      if (dto.shift_id) {
        shift = await manager.findOne(HrShift, {
        where: { shift_id: dto.shift_id }
      });

        if (!shift) {
          throw new NotFoundException('Shift not found');
        }
      }

      const checkInTime = new Date();

      // Calculate late if shift exists
      let isLate = false;
      let lateMinutes = 0;

      if (shift) {
        const [shiftHour, shiftMinute] = shift.start_time.split(':').map(Number);
        const shiftStart = new Date(today);
        shiftStart.setHours(shiftHour, shiftMinute, 0, 0);

        if (checkInTime > shiftStart) {
          isLate = true;
          lateMinutes = Math.floor(
            (checkInTime.getTime() - shiftStart.getTime()) / 60000,
          );
        }
      }

      const attendance = manager.create(HrTimeAttendance, {
        staff_id: dto.staff_id,
        shift_id: dto.shift_id,
        work_date: today,
        check_in_time: checkInTime,
        check_in_ip: dto.ip_address,
        is_late: isLate,
        late_minutes: lateMinutes,
        status: AttendanceStatus.PRESENT,
      });

      return await manager.save(attendance);
    });
  }

  /**
   * Check-out
   */
  async checkOut(dto: CheckOutDto): Promise<HrTimeAttendance> {
    return await this.dataSource.transaction(async (manager) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const attendance = await manager.findOne(HrTimeAttendance, {
        where: {
          staff_id: dto.staff_id,
          work_date: today,
        },
      });

      if (!attendance) {
        throw new NotFoundException('No check-in record found for today');
      }

      if (attendance.check_out_time) {
        throw new BadRequestException('Already checked out');
      }

      const checkOutTime = new Date();
      attendance.check_out_time = checkOutTime;
      attendance.check_out_ip = dto.ip_address;

      // Calculate actual hours
      if (attendance.check_in_time) {
        const diffMs =
          checkOutTime.getTime() - attendance.check_in_time.getTime();
        const hours = diffMs / (1000 * 60 * 60);
        attendance.actual_hours = hours.toFixed(2);
      }

      // Check early leave if shift exists
      if (attendance.shift_id) {
        const shift = await manager
          .createQueryBuilder()
          .select('*')
          .from('hr_shifts', 's')
          .where('s.shift_id = :id', { id: attendance.shift_id })
          .getRawOne();

        if (shift) {
          const [shiftHour, shiftMinute] = shift.end_time.split(':').map(Number);
          const shiftEnd = new Date(today);
          shiftEnd.setHours(shiftHour, shiftMinute, 0, 0);

          if (checkOutTime < shiftEnd) {
            attendance.is_early_leave = true;
            attendance.early_leave_minutes = Math.floor(
              (shiftEnd.getTime() - checkOutTime.getTime()) / 60000,
            );
          } else if (checkOutTime > shiftEnd) {
            // Calculate overtime
            attendance.overtime_minutes = Math.floor(
              (checkOutTime.getTime() - shiftEnd.getTime()) / 60000,
            );
          }
        }
      }

      return await manager.save(attendance);
    });
  }

  /**
   * Lấy danh sách chấm công
   */
  async findAll(query: QueryAttendanceDto) {
    const {
      page = 1,
      limit = 20,
      staff_id,
      status,
      shift_id,
      from_date,
      to_date,
    } = query;
    const skip = (page - 1) * limit;

    const qb = this.attendanceRepo
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.staff', 'staff')
      .leftJoinAndSelect('attendance.shift', 'shift')
      .leftJoinAndSelect('attendance.leave_request', 'leave');

    if (staff_id) {
      qb.andWhere('attendance.staff_id = :staff_id', { staff_id });
    }

    if (status) {
      qb.andWhere('attendance.status = :status', { status });
    }

    if (shift_id) {
      qb.andWhere('attendance.shift_id = :shift_id', { shift_id });
    }

    if (from_date) {
      qb.andWhere('attendance.work_date >= :from_date', {
        from_date: new Date(from_date),
      });
    }

    if (to_date) {
      qb.andWhere('attendance.work_date <= :to_date', {
        to_date: new Date(to_date),
      });
    }

    qb.orderBy('attendance.work_date', 'DESC');
    qb.addOrderBy('attendance.check_in_time', 'DESC');
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
   * Lấy chi tiết chấm công
   */
  async findOne(id: string): Promise<HrTimeAttendance> {
    const attendance = await this.attendanceRepo.findOne({
      where: { attendance_id: id },
      relations: ['staff', 'shift', 'leave_request'],
    });

    if (!attendance) {
      throw new NotFoundException(`Attendance ${id} not found`);
    }

    return attendance;
  }

  /**
   * Cập nhật chấm công (Admin)
   */
  async update(id: string, dto: UpdateAttendanceDto): Promise<HrTimeAttendance> {
    const attendance = await this.findOne(id);

    Object.assign(attendance, dto);

    return await this.attendanceRepo.save(attendance);
  }

  /**
   * Báo cáo chấm công theo tháng
   */
  async getMonthlyReport(staffId: string, year: number, month: number) {
    const result = await this.dataSource.query(
      `
      SELECT 
        status,
        COUNT(*) as day_count,
        SUM(CASE WHEN is_late = true THEN 1 ELSE 0 END) as late_count,
        SUM(CASE WHEN is_early_leave = true THEN 1 ELSE 0 END) as early_leave_count,
        SUM(overtime_minutes) as total_overtime_minutes
      FROM hr_time_attendance
      WHERE staff_id = $1
        AND EXTRACT(YEAR FROM work_date) = $2
        AND EXTRACT(MONTH FROM work_date) = $3
      GROUP BY status
      `,
      [staffId, year, month],
    );

    return result;
  }

  /**
   * Xóa bản ghi chấm công (soft delete)
   */
  async remove(id: string): Promise<void> {
    const result = await this.attendanceRepo.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Attendance ${id} not found`);
    }
  }
}