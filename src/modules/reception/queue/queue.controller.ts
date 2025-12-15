import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  ParseEnumPipe,
} from '@nestjs/common';
import { QueueService } from './queue.service';
import {
  CreateTicketDto,
  CreateTicketFromAppointmentDto,
  UpdateTicketDto,
  QueryTicketDto,
  AssignServicesDto,
} from './dto/queue.dto';
import { QueueTicketType } from 'src/database/entities/reception/queue_tickets.entity';

@Controller('reception/queue')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}
  // Tạo một queue ticket thủ công (walk-in hoặc online nếu set source). - API mô phỏng kiosk
  @Post('tickets')
  @HttpCode(HttpStatus.CREATED)
  createTicket(@Body() dto: CreateTicketDto) {
    return this.queueService.createTicket(dto);
  }

  // Tạo một queue ticket thủ công (walk-in hoặc online nếu bạn set source). - API đặt lịch (khi confirm appointment bởi lễ tân thì sẽ tạo ticket)
  @Post('tickets/from-appointment')
  @HttpCode(HttpStatus.CREATED)
  createTicketFromAppointment(@Body() dto: CreateTicketFromAppointmentDto) {
    return this.queueService.createTicketFromAppointment(dto);
  }
  
  // List ticket theo filter + phân trang.
  @Get('tickets')
  findAll(@Query() query: QueryTicketDto) {
    return this.queueService.findAll(query);
  }

  // Lấy tất cả ticket trong ngày hôm nay của 1 phòng (lọc theo created_at từ 00:00 đến trước 00:00 ngày mai).
  @Get('tickets/today/:roomId')
  getTodayTickets(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Query('ticket_type', new ParseEnumPipe(QueueTicketType, { optional: true }))
    queueTicketType?: QueueTicketType,
  ) {
    return this.queueService.getTodayTicketsByRoom(roomId, queueTicketType);
  }

  // Lấy danh sách ticket đang WAITING của 1 phòng.
  @Get('tickets/waiting/:roomId')
  getWaitingTickets(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Query('ticket_type', new ParseEnumPipe(QueueTicketType, { optional: true }))
    queueTicketType?: QueueTicketType,
  ) {
    return this.queueService.getWaitingTickets(roomId, queueTicketType);
  }

  // Lấy chi tiết 1 ticket.
  @Get('tickets/:id')
  findOne(@Param('id') id: string) {
    return this.queueService.findOne(id);
  }

  // “Gọi số tiếp theo”: lấy ticket WAITING nhỏ nhất theo display_number của room + ticketType, đổi trạng thái.
  @Post('tickets/call-next/:roomId/:queueTicketType')
  @HttpCode(HttpStatus.OK)
  callNext(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Param('queueTicketType', new ParseEnumPipe(QueueTicketType)) queueTicketType: QueueTicketType,
  ) {
    return this.queueService.callNext(roomId, queueTicketType);
  }

  // Gọi một ticket cụ thể (không theo thứ tự).
  @Post('tickets/:id/call')
  @HttpCode(HttpStatus.OK)
  callSpecific(@Param('id') id: string) {
    return this.queueService.callSpecific(id);
  }

  // Bắt đầu phục vụ ticket.
  @Post('tickets/:id/start')
  @HttpCode(HttpStatus.OK)
  startService(@Param('id') id: string) {
    return this.queueService.startService(id);
  }

  // Hoàn tất ticket.
  @Post('tickets/:id/complete')
  @HttpCode(HttpStatus.OK)
  completeTicket(@Param('id') id: string) {
    return this.queueService.completeTicket(id);
  }

  // Bỏ qua ticket (skip).
  @Post('tickets/:id/skip')
  @HttpCode(HttpStatus.OK)
  skipTicket(@Param('id') id: string) {
    return this.queueService.skipTicket(id);
  }

  // Gán danh sách dịch vụ cho ticket (ví dụ ticket khám cần làm thêm dịch vụ). - Chỉ định CLS
  @Post('tickets/:id/assign-services')
  @HttpCode(HttpStatus.OK)
  assignServices(@Param('id') id: string, @Body() dto: AssignServicesDto) {
    return this.queueService.assignServices(id, dto);
  }

  // Update ticket theo UpdateTicketDto (partial update).
  @Patch('tickets/:id')
  update(@Param('id') id: string, @Body() dto: UpdateTicketDto) {
    return this.queueService.update(id, dto);
  }

  // Dọn counter cũ (đang xóa những counter có reset_date < 7 ngày trước).
  @Post('counters/reset')
  @HttpCode(HttpStatus.OK)
  resetCounters() {
    return this.queueService.resetCounters();
  }
}