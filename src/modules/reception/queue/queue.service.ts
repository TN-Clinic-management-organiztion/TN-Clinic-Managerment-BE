import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import {
  QueueTicket,
  QueueStatus,
  QueueSource,
  QueueTicketType,
} from '../../../database/entities/reception/queue_tickets.entity';
import { QueueCounter } from '../../../database/entities/reception/queue_counters.entity';
import {
  CreateTicketDto,
  CreateTicketFromAppointmentDto,
  UpdateTicketDto,
  QueryTicketDto,
  AssignServicesDto,
} from './dto/queue.dto';
import { OnlineAppointment, AppointmentStatus } from '../../../database/entities/reception/online_appointments.entity';
import { RoomType } from '../../../database/entities/auth/org_rooms.entity';

@Injectable()
export class QueueService {
  constructor(
    @InjectRepository(QueueTicket)
    private readonly ticketRepo: Repository<QueueTicket>,
    @InjectRepository(QueueCounter)
    private readonly counterRepo: Repository<QueueCounter>,
    private readonly dataSource: DataSource,
  ) {}

  // ==================== COUNTER LOGIC ====================

  private async getOrCreateCounter(
    manager: EntityManager,
    roomId: number,
    ticketType: QueueTicketType,
  ): Promise<QueueCounter> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let counter = await manager.getRepository(QueueCounter).findOne({
      where: {
        room_id: roomId,
        ticket_type: ticketType,
        reset_date: today,
      },
    });

    if (!counter) {
      // Tạo counter mới cho ngày hôm nay
      counter = manager.getRepository(QueueCounter).create({
        room_id: roomId,
        ticket_type: ticketType,
        last_number: 0,
        reset_date: today,
      });
      counter = await manager.getRepository(QueueCounter).save(counter);
    }

    return counter;
  }

  private async incrementCounter(
    manager: EntityManager,
    roomId: number,
    ticketType: QueueTicketType,
  ): Promise<number> {
    const counter = await this.getOrCreateCounter(manager, roomId, ticketType);

    counter.last_number += 1;
    await manager.getRepository(QueueCounter).save(counter);

    return counter.last_number;
  }
  // Lưu ý chỗ này là không xoá counters
  async resetCounters(): Promise<void> {
    // Gọi hàm này qua CRON job mỗi ngày
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    // Xóa counters cũ (giữ lại 7 ngày)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    await this.counterRepo
      .createQueryBuilder()
      .delete()
      .where('reset_date < :date', { date: sevenDaysAgo })
      .execute();
  }

  // ==================== TICKET LOGIC ====================

  async createTicket(dto: CreateTicketDto): Promise<QueueTicket> {
    // Validate room
    const roomExists = await this.dataSource.manager
      .createQueryBuilder()
      .select('1')
      .from('org_rooms', 'r')
      .where('r.room_id = :id', { id: dto.room_id })
      .andWhere('r.is_active = true')
      .getRawOne();

    if (!roomExists) {
      throw new NotFoundException('Room not found');
    }

    // Validate encounter if provided
    if (dto.encounter_id) {
      const encounterExists = await this.dataSource.manager
        .createQueryBuilder()
        .select('1')
        .from('medical_encounters', 'e')
        .where('e.encounter_id = :id', { id: dto.encounter_id })
        .getRawOne();

      if (!encounterExists) {
        throw new NotFoundException('Encounter not found');
      }
    }

    // Validate service_ids if provided
    if (dto.service_ids && dto.service_ids.length > 0) {
      const services = await this.dataSource.manager
        .createQueryBuilder()
        .select('service_id')
        .from('ref_services', 's')
        .where('s.service_id IN (:...ids)', { ids: dto.service_ids })
        .getRawMany();

      if (services.length !== dto.service_ids.length) {
        throw new NotFoundException('Some services not found');
      }
    }

    if (
      dto.ticket_type === QueueTicketType.REGISTRATION &&
      dto.encounter_id !== undefined &&
      dto.encounter_id !== null
    ) {
      throw new BadRequestException(
        'REGISTRATION tickets must not include an encounter_id',
      );
    }

    // For REGISTRATION tickets we must ensure the room is a CASHIER counter
    const roomInfo = await this.dataSource.manager
      .createQueryBuilder()
      .select('room_type')
      .from('org_rooms', 'r')
      .where('r.room_id = :id', { id: dto.room_id })
      .getRawOne<{ room_type: RoomType }>();

    if (!roomInfo) {
      throw new NotFoundException('Room not found');
    }

    if (
      dto.ticket_type === QueueTicketType.REGISTRATION &&
      roomInfo.room_type !== RoomType.CASHIER
    ) {
      throw new BadRequestException(
        'REGISTRATION tickets must be created at a CASHIER room',
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get next number from counter
      const displayNumber = await this.incrementCounter(
        queryRunner.manager,
        dto.room_id,
        dto.ticket_type,
      );

      // Create ticket
      const ticket = queryRunner.manager.getRepository(QueueTicket).create({
        ...dto,
        encounter_id:
          dto.ticket_type === QueueTicketType.REGISTRATION
            ? null
            : dto.encounter_id,
        display_number: displayNumber,
        status: QueueStatus.WAITING,
        source: dto.source ?? QueueSource.WALKIN,
      });

      const savedTicket = await queryRunner.manager.save(ticket);

      await queryRunner.commitTransaction();

      return await this.findOne(savedTicket.ticket_id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async createTicketFromAppointment(
    dto: CreateTicketFromAppointmentDto,
  ): Promise<QueueTicket> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      const appointment = await manager
        .getRepository(OnlineAppointment)
        .findOne({ where: { appointment_id: dto.appointment_id } });

      if (!appointment) {
        throw new NotFoundException('Appointment not found');
      }

      if (appointment.status === AppointmentStatus.CANCELLED) {
        throw new BadRequestException('Cancelled appointments cannot create tickets');
      }

      if (appointment.status === AppointmentStatus.COMPLETED) {
        throw new BadRequestException('Completed appointments cannot create tickets');
      }

      // ensure room is cashier
      const room = await manager
        .createQueryBuilder()
        .select(['room_id', 'room_type'])
        .from('org_rooms', 'r')
        .where('r.room_id = :roomId', { roomId: dto.room_id })
        .andWhere('r.is_active = true')
        .getRawOne<{ room_id: number; room_type: RoomType }>();

      if (!room) {
        throw new NotFoundException('Room not found');
      }

      if (room.room_type !== RoomType.CASHIER) {
        throw new BadRequestException(
          'Appointments must be checked in at a CASHIER room',
        );
      }

      // Prevent duplicate tickets for the same appointment
      const existingTicket = await manager
        .getRepository(QueueTicket)
        .findOne({ where: { appointment_id: dto.appointment_id } });

      if (existingTicket) {
        await queryRunner.commitTransaction();
        return this.findOne(existingTicket.ticket_id);
      }

      const displayNumber = await this.incrementCounter(
        manager,
        dto.room_id,
        QueueTicketType.REGISTRATION,
      );

      const ticket = manager.getRepository(QueueTicket).create({
        appointment_id: dto.appointment_id,
        room_id: dto.room_id,
        ticket_type: QueueTicketType.REGISTRATION,
        display_number: displayNumber,
        source: QueueSource.ONLINE,
        status: QueueStatus.WAITING,
        encounter_id: null,
      });

      const savedTicket = await manager.save(ticket);

      // Update appointment status on confirmation/check-in
      appointment.status = AppointmentStatus.CONFIRMED;
      await manager.save(appointment);

      await queryRunner.commitTransaction();

      return await this.findOne(savedTicket.ticket_id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(query: QueryTicketDto) {
    const {
      page = 1,
      limit = 20,
      room_id,
      ticket_type,
      status,
      source,
      encounter_id,
    } = query;
    const skip = (page - 1) * limit;

    const qb = this.ticketRepo
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.room', 'room')
      .leftJoinAndSelect('ticket.encounter', 'encounter')
      .leftJoinAndSelect('encounter.patient', 'patient');

    if (room_id) {
      qb.where('ticket.room_id = :room_id', { room_id });
    }

    if (ticket_type) {
      qb.andWhere('ticket.ticket_type = :ticket_type', { ticket_type });
    }

    if (status) {
      qb.andWhere('ticket.status = :status', { status });
    }

    if (source) {
      qb.andWhere('ticket.source = :source', { source });
    }

    if (encounter_id) {
      qb.andWhere('ticket.encounter_id = :encounter_id', { encounter_id });
    }

    qb.orderBy('ticket.created_at', 'DESC');
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

  async findOne(id: string): Promise<QueueTicket> {
    const ticket = await this.ticketRepo.findOne({
      where: { ticket_id: id },
      relations: ['room', 'encounter', 'encounter.patient', 'appointment'],
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }

    return ticket;
  }

  async getTodayTicketsByRoom(
    roomId: number,
    ticketType?: QueueTicketType,
  ): Promise<QueueTicket[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const qb = this.ticketRepo
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.encounter', 'encounter')
      .leftJoinAndSelect('encounter.patient', 'patient')
      .where('ticket.room_id = :roomId', { roomId })
      .andWhere('ticket.created_at >= :today', { today })
      .andWhere('ticket.created_at < :tomorrow', { tomorrow });

    if (ticketType) {
      qb.andWhere('ticket.ticket_type = :ticketType', { ticketType });
    }

    qb.orderBy('ticket.display_number', 'ASC');

    return await qb.getMany();
  }

  async getWaitingTickets(
    roomId: number,
    ticketType?: QueueTicketType,
  ): Promise<QueueTicket[]> {
    const qb = this.ticketRepo
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.encounter', 'encounter')
      .leftJoinAndSelect('encounter.patient', 'patient')
      .where('ticket.room_id = :roomId', { roomId })
      .andWhere('ticket.status = :status', { status: QueueStatus.WAITING });

    if (ticketType) {
      qb.andWhere('ticket.ticket_type = :ticketType', { ticketType });
    }

    qb.orderBy('ticket.display_number', 'ASC');

    return await qb.getMany();
  }

  async callNext(roomId: number, ticketType: QueueTicketType): Promise<QueueTicket> {
    const waitingTickets = await this.getWaitingTickets(roomId, ticketType);

    if (waitingTickets.length === 0) {
      throw new NotFoundException('No waiting tickets');
    }

    const nextTicket = waitingTickets[0];
    nextTicket.status = QueueStatus.CALLED;
    nextTicket.called_at = new Date();

    return await this.ticketRepo.save(nextTicket);
  }

  async callSpecific(ticketId: string): Promise<QueueTicket> {
    const ticket = await this.ticketRepo.findOne({
      where: { ticket_id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${ticketId} not found`);
    }

    if (ticket.status !== QueueStatus.WAITING) {
      throw new BadRequestException('Only WAITING tickets can be called');
    }

    ticket.status = QueueStatus.CALLED;
    ticket.called_at = new Date();

    return await this.ticketRepo.save(ticket);
  }

  async startService(ticketId: string): Promise<QueueTicket> {
    const ticket = await this.ticketRepo.findOne({
      where: { ticket_id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${ticketId} not found`);
    }

    if (ticket.status !== QueueStatus.CALLED) {
      throw new BadRequestException('Only CALLED tickets can start service');
    }

    ticket.status = QueueStatus.IN_PROGRESS;
    ticket.started_at = new Date();

    return await this.ticketRepo.save(ticket);
  }

  async completeTicket(ticketId: string): Promise<QueueTicket> {
    const ticket = await this.ticketRepo.findOne({
      where: { ticket_id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${ticketId} not found`);
    }

    if (ticket.status !== QueueStatus.IN_PROGRESS) {
      throw new BadRequestException(
        'Only IN_PROGRESS tickets can be completed',
      );
    }

    ticket.status = QueueStatus.COMPLETED;
    ticket.completed_at = new Date();

    return await this.ticketRepo.save(ticket);
  }

  async skipTicket(ticketId: string): Promise<QueueTicket> {
    const ticket = await this.ticketRepo.findOne({
      where: { ticket_id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${ticketId} not found`);
    }

    if (
      ticket.status !== QueueStatus.CALLED &&
      ticket.status !== QueueStatus.WAITING
    ) {
      throw new BadRequestException(
        'Only CALLED or WAITING tickets can be skipped',
      );
    }

    ticket.status = QueueStatus.SKIPPED;

    return await this.ticketRepo.save(ticket);
  }

  async assignServices(
    ticketId: string,
    dto: AssignServicesDto,
  ): Promise<QueueTicket> {
    const ticket = await this.ticketRepo.findOne({
      where: { ticket_id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${ticketId} not found`);
    }

    // Validate services
    const services = await this.dataSource.manager
      .createQueryBuilder()
      .select('service_id')
      .from('ref_services', 's')
      .where('s.service_id IN (:...ids)', { ids: dto.service_ids })
      .getRawMany();

    if (services.length !== dto.service_ids.length) {
      throw new NotFoundException('Some services not found');
    }

    ticket.service_ids = dto.service_ids;

    return await this.ticketRepo.save(ticket);
  }

  async update(id: string, dto: UpdateTicketDto): Promise<QueueTicket> {
    const ticket = await this.ticketRepo.findOne({
      where: { ticket_id: id },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }

    Object.assign(ticket, dto);

    return await this.ticketRepo.save(ticket);
  }
}