import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HrShift } from '../../../database/entities/hr/hr_shifts.entity';
import { CreateShiftDto, UpdateShiftDto } from './dto/shift.dto';

@Injectable()
export class ShiftsService {
  constructor(
    @InjectRepository(HrShift)
    private readonly shiftRepo: Repository<HrShift>,
  ) {}

  /**
   * Tạo ca làm việc mới
   */
  async create(dto: CreateShiftDto): Promise<HrShift> {
    const shift = this.shiftRepo.create(dto);
    return await this.shiftRepo.save(shift);
  }

  /**
   * Lấy danh sách tất cả ca làm việc
   */
  async findAll(): Promise<HrShift[]> {
    return await this.shiftRepo.find({
      order: { start_time: 'ASC' },
    });
  }

  /**
   * Lấy chi tiết ca làm việc
   */
  async findOne(id: number): Promise<HrShift> {
    const shift = await this.shiftRepo.findOne({
      where: { shift_id: id },
    });

    if (!shift) {
      throw new NotFoundException(`Shift with ID ${id} not found`);
    }

    return shift;
  }

  /**
   * Cập nhật ca làm việc
   */
  async update(id: number, dto: UpdateShiftDto): Promise<HrShift> {
    const shift = await this.findOne(id);

    Object.assign(shift, dto);

    return await this.shiftRepo.save(shift);
  }

  /**
   * Xóa ca làm việc
   */
  // Cần check có người nào đang làm ca này hay không, nếu còn thì không được xoá
  async remove(id: number): Promise<void> {
    const result = await this.shiftRepo.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Shift with ID ${id} not found`);
    }
  }
}