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
  ParseIntPipe,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import {
  CheckInDto,
  CheckOutDto,
  QueryAttendanceDto,
  UpdateAttendanceDto,
} from './dto/attendance.dto';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  /**
   * Check-in
   * POST /attendance/check-in
   */
  @Post('check-in')
  @HttpCode(HttpStatus.CREATED)
  checkIn(@Body() checkInDto: CheckInDto) {
    return this.attendanceService.checkIn(checkInDto);
  }

  /**
   * Check-out
   * POST /attendance/check-out
   */
  @Post('check-out')
  @HttpCode(HttpStatus.OK)
  checkOut(@Body() checkOutDto: CheckOutDto) {
    return this.attendanceService.checkOut(checkOutDto);
  }

  /**
   * Lấy danh sách chấm công
   * GET /attendance?page=1&limit=20&staff_id=xxx
   */
  @Get()
  findAll(@Query() query: QueryAttendanceDto) {
    return this.attendanceService.findAll(query);
  }

  /**
   * Lấy báo cáo chấm công theo tháng
   * GET /attendance/report/:staffId?year=2024&month=12
   */
  @Get('report/:staffId')
  getMonthlyReport(
    @Param('staffId') staffId: string,
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
  ) {
    return this.attendanceService.getMonthlyReport(staffId, year, month);
  }

  /**
   * Lấy chi tiết chấm công
   * GET /attendance/:id
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attendanceService.findOne(id);
  }

  /**
   * Cập nhật chấm công (Admin)
   * PATCH /attendance/:id
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateAttendanceDto) {
    return this.attendanceService.update(id, updateDto);
  }

  /**
   * Xóa bản ghi chấm công
   * DELETE /attendance/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.attendanceService.remove(id);
  }
}