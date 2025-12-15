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
import { AppointmentsService } from './appointments.service';
import {
  CreateAppointmentDto,
  UpdateAppointmentDto,
  QueryAppointmentDto,
} from './dto/appointment.dto';

@Controller('reception/appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  // Tạo lịch hẹn online -- cần confirm để tạo ticket trong queue_tickets
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateAppointmentDto) {
    return this.appointmentsService.create(dto);
  }

  // Danh sách lịch hẹn có filter + phân trang.
  @Get()
  findAll(@Query() query: QueryAppointmentDto) {
    return this.appointmentsService.findAll(query);
  }

  // Lấy danh sách lịch hẹn trong ngày hôm nay, chỉ lấy status PENDING và CONFIRMED.
  @Get('today')
  getTodayAppointments(@Query('room_id', ParseIntPipe) roomId?: number) {
    return this.appointmentsService.getTodayAppointments(roomId);
  }

  // Lấy chi tiết 1 lịch hẹn.
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  @Post(':id/confirm')
  @HttpCode(HttpStatus.OK)
  confirm(@Param('id') id: string) {
    return this.appointmentsService.confirm(id);
  }

  // Hủy lịch hẹn.
  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  cancel(@Param('id') id: string) {
    return this.appointmentsService.cancel(id);
  }

  // Đánh dấu bệnh nhân không tới (NO_SHOW).
  @Post(':id/no-show')
  @HttpCode(HttpStatus.OK)
  markNoShow(@Param('id') id: string) {
    return this.appointmentsService.markNoShow(id);
  }

  // Cập nhật thông tin lịch hẹn (partial update).
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAppointmentDto) {
    return this.appointmentsService.update(id, dto);
  }

  // Xóa mềm (soft delete) bằng cách set deleted_at = now.
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(id);
  }
}
