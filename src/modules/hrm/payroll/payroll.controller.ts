import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PayrollService } from './payroll.service';
import {
  CreatePayrollDto,
  UpdatePayrollDto,
  QueryPayrollDto,
  CalculatePayrollDto,
} from './dto/payroll.dto';

@Controller('payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  /**
   * Tạo bảng lương (Draft)
   * POST /payroll
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreatePayrollDto) {
    return this.payrollService.create(createDto);
  }

  /**
   * Tính lương tự động
   * POST /payroll/calculate
   */
  @Post('calculate')
  @HttpCode(HttpStatus.OK)
  calculatePayroll(@Body() calculateDto: CalculatePayrollDto) {
    return this.payrollService.calculatePayroll(calculateDto);
  }

  /**
   * Lấy danh sách bảng lương
   * GET /payroll?page=1&limit=20&staff_id=xxx&year=2024&month=12
   */
  @Get()
  findAll(@Query() query: QueryPayrollDto) {
    return this.payrollService.findAll(query);
  }

  /**
   * Lấy chi tiết bảng lương
   * GET /payroll/:id
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.payrollService.findOne(id);
  }

  /**
   * Cập nhật bảng lương
   * PATCH /payroll/:id
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdatePayrollDto) {
    return this.payrollService.update(id, updateDto);
  }

  /**
   * Phê duyệt bảng lương
   * POST /payroll/:id/approve
   */
  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  approve(@Param('id') id: string, @Body('approver_id') approverId: string) {
    return this.payrollService.approve(id, approverId);
  }

  /**
   * Đánh dấu đã trả lương
   * POST /payroll/:id/mark-paid
   */
  @Post(':id/mark-paid')
  @HttpCode(HttpStatus.OK)
  markAsPaid(@Param('id') id: string) {
    return this.payrollService.markAsPaid(id);
  }

  /**
   * Xóa bảng lương
   * DELETE /payroll/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.payrollService.remove(id);
  }
}