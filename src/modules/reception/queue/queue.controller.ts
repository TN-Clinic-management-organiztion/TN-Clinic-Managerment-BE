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

  @Post('tickets')
  @HttpCode(HttpStatus.CREATED)
  createTicket(@Body() dto: CreateTicketDto) {
    return this.queueService.createTicket(dto);
  }

  @Post('tickets/from-appointment')
  @HttpCode(HttpStatus.CREATED)
  createTicketFromAppointment(@Body() dto: CreateTicketFromAppointmentDto) {
    return this.queueService.createTicketFromAppointment(dto);
  }

  @Get('tickets')
  findAll(@Query() query: QueryTicketDto) {
    return this.queueService.findAll(query);
  }

  @Get('tickets/today/:roomId')
  getTodayTickets(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Query('ticket_type', new ParseEnumPipe(QueueTicketType, { optional: true }))
    queueTicketType?: QueueTicketType,
  ) {
    return this.queueService.getTodayTicketsByRoom(roomId, queueTicketType);
  }

  @Get('tickets/waiting/:roomId')
  getWaitingTickets(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Query('ticket_type', new ParseEnumPipe(QueueTicketType, { optional: true }))
    queueTicketType?: QueueTicketType,
  ) {
    return this.queueService.getWaitingTickets(roomId, queueTicketType);
  }

  @Get('tickets/:id')
  findOne(@Param('id') id: string) {
    return this.queueService.findOne(id);
  }

  @Post('tickets/call-next/:roomId/:queueTicketType')
  @HttpCode(HttpStatus.OK)
  callNext(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Param('queueTicketType', new ParseEnumPipe(QueueTicketType)) queueTicketType: QueueTicketType,
  ) {
    return this.queueService.callNext(roomId, queueTicketType);
  }

  @Post('tickets/:id/call')
  @HttpCode(HttpStatus.OK)
  callSpecific(@Param('id') id: string) {
    return this.queueService.callSpecific(id);
  }

  @Post('tickets/:id/start')
  @HttpCode(HttpStatus.OK)
  startService(@Param('id') id: string) {
    return this.queueService.startService(id);
  }

  @Post('tickets/:id/complete')
  @HttpCode(HttpStatus.OK)
  completeTicket(@Param('id') id: string) {
    return this.queueService.completeTicket(id);
  }

  @Post('tickets/:id/skip')
  @HttpCode(HttpStatus.OK)
  skipTicket(@Param('id') id: string) {
    return this.queueService.skipTicket(id);
  }

  @Post('tickets/:id/assign-services')
  @HttpCode(HttpStatus.OK)
  assignServices(@Param('id') id: string, @Body() dto: AssignServicesDto) {
    return this.queueService.assignServices(id, dto);
  }

  @Patch('tickets/:id')
  update(@Param('id') id: string, @Body() dto: UpdateTicketDto) {
    return this.queueService.update(id, dto);
  }

  @Post('counters/reset')
  @HttpCode(HttpStatus.OK)
  resetCounters() {
    return this.queueService.resetCounters();
  }
}