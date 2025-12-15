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
  UpdateTicketDto,
  QueryTicketDto,
  AssignServicesDto,
} from './dto/queue.dto';
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

  private startOfDay(d = new Date()) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  }

  // ==================== COUNTER LOGIC ====================

  private async getOrCreateCounter(
    manager: EntityManager,
    roomId: number,
    ticketType: QueueTicketType,
  ): Promise<QueueCounter> {
    const today = this.startOfDay();

    let counter = await manager.getRepository(QueueCounter).findOne({
      where: { room_id: roomId, ticket_type: ticketType, reset_date: today },
    });

    if (!counter) {
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

  async resetCounters(): Promise<void> {
    const sevenDaysAgo = this.startOfDay();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    await this.counterRepo
      .createQueryBuilder()
      .delete()
      .where('reset_date < :date', { date: sevenDaysAgo })
      .execute();
  }

  // ==================== TICKET LOGIC ====================

  async createTicket(dto: CreateTicketDto): Promise<QueueTicket> {
    // Validate room exists + active + get room_type
    const roomInfo = await this.dataSource.manager
      .createQueryBuilder()
      .select(['r.room_id as room_id', 'r.room_type as room_type'])
      .from('org_rooms', 'r')
      .where('r.room_id = :id', { id: dto.room_id })
      .andWhere('r.is_active = true')
      .getRawOne<{ room_id: number; room_type: RoomType }>();

    if (!roomInfo) throw new NotFoundException('Room not found');

    // Validate encounter if provided
    if (dto.encounter_id) {
      const encounterExists = await this.dataSource.manager
        .createQueryBuilder()
        .select('1')
        .from('medical_encounters', 'e')
        .where('e.encounter_id = :id', { id: dto.encounter_id })
        .getRawOne();

      if (!encounterExists) throw new NotFoundException('Encounter not found');
    }

    // Validate services if provided
    if (dto.service_ids?.length) {
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

    // Business rules
    if (dto.ticket_type === QueueTicketType.REGISTRATION) {
      // REGISTRATION must not include encounter_id
      if (dto.encounter_id !== undefined && dto.encounter_id !== null) {
        throw new BadRequestException(
          'REGISTRATION tickets must not include an encounter_id',
        );
      }
      // REGISTRATION must be created at CASHIER
      if (roomInfo.room_type !== RoomType.CASHIER) {
        throw new BadRequestException(
          'REGISTRATION tickets must be created at a CASHIER room',
        );
      }
    } else {
      // CONSULTATION/SERVICE: should have encounter_id
      if (!dto.encounter_id) {
        throw new BadRequestException(
          'CONSULTATION/SERVICE tickets must include an encounter_id',
        );
      }
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const displayNumber = await this.incrementCounter(
        queryRunner.manager,
        dto.room_id,
        dto.ticket_type,
      );

      const ticket = queryRunner.manager.getRepository(QueueTicket).create({
        room_id: dto.room_id,
        ticket_type: dto.ticket_type,
        display_number: displayNumber,
        status: QueueStatus.WAITING,
        source: dto.source ?? QueueSource.WALKIN,

        // IMPORTANT: DTO không có appointment_id -> luôn null
        appointment_id: null,

        // REGISTRATION luôn null encounter_id
        encounter_id:
          dto.ticket_type === QueueTicketType.REGISTRATION
            ? null
            : dto.encounter_id,

        // IMPORTANT: service_ids dùng undefined (không dùng null)
        service_ids: dto.service_ids?.length ? dto.service_ids : undefined,
      });

      const saved = await queryRunner.manager.save(ticket); // saved là QueueTicket (không phải array)
      await queryRunner.commitTransaction();

      return this.findOne(saved.ticket_id);
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

    // KHÔNG cần .where('1=1') — cứ andWhere bình thường vẫn chạy
    if (room_id) qb.andWhere('ticket.room_id = :room_id', { room_id });
    if (ticket_type) qb.andWhere('ticket.ticket_type = :ticket_type', { ticket_type });
    if (status) qb.andWhere('ticket.status = :status', { status });
    if (source) qb.andWhere('ticket.source = :source', { source });
    if (encounter_id) qb.andWhere('ticket.encounter_id = :encounter_id', { encounter_id });

    qb.orderBy('ticket.created_at', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<QueueTicket> {
    const ticket = await this.ticketRepo.findOne({
      where: { ticket_id: id },
      relations: ['room', 'encounter', 'encounter.patient', 'appointment'],
    });

    if (!ticket) throw new NotFoundException(`Ticket with ID ${id} not found`);
    return ticket;
  }

  async getTodayTicketsByRoom(
    roomId: number,
    ticketType?: QueueTicketType,
    source?: QueueSource,
  ): Promise<QueueTicket[]> {
    const today = this.startOfDay();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const qb = this.ticketRepo
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.encounter', 'encounter')
      .leftJoinAndSelect('encounter.patient', 'enc_patient')
      .where('ticket.room_id = :roomId', { roomId })
      .andWhere('ticket.created_at >= :today', { today })
      .andWhere('ticket.created_at < :tomorrow', { tomorrow });

    if (source) qb.andWhere('ticket.source = :source', { source });
    if (ticketType) qb.andWhere('ticket.ticket_type = :ticketType', { ticketType });

    qb.orderBy('ticket.display_number', 'ASC');
    return qb.getMany();
  }

  async getWaitingTickets(
    roomId: number,
    ticketType?: QueueTicketType,
    source?: QueueSource,
  ): Promise<QueueTicket[]> {
    const qb = this.ticketRepo
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.encounter', 'encounter')
      .leftJoinAndSelect('encounter.patient', 'enc_patient')
      .where('ticket.room_id = :roomId', { roomId })
      .andWhere('ticket.status = :status', { status: QueueStatus.WAITING });

    if (ticketType) qb.andWhere('ticket.ticket_type = :ticketType', { ticketType });
    if (source) qb.andWhere('ticket.source = :source', { source });

    qb.orderBy('ticket.display_number', 'ASC');
    return qb.getMany();
  }

  async callNext(roomId: number, ticketType: QueueTicketType, source?: QueueSource) {
    const waitingTickets = await this.getWaitingTickets(roomId, ticketType, source);
    if (!waitingTickets.length) throw new NotFoundException('No waiting tickets');

    const nextTicket = waitingTickets[0];
    nextTicket.status = QueueStatus.CALLED;
    nextTicket.called_at = new Date();

    return this.ticketRepo.save(nextTicket);
  }

  async callSpecific(ticketId: string): Promise<QueueTicket> {
    const ticket = await this.ticketRepo.findOne({ where: { ticket_id: ticketId } });
    if (!ticket) throw new NotFoundException(`Ticket with ID ${ticketId} not found`);
    if (ticket.status !== QueueStatus.WAITING) {
      throw new BadRequestException('Only WAITING tickets can be called');
    }

    ticket.status = QueueStatus.CALLED;
    ticket.called_at = new Date();
    return this.ticketRepo.save(ticket);
  }

  async startService(ticketId: string): Promise<QueueTicket> {
    const ticket = await this.ticketRepo.findOne({ where: { ticket_id: ticketId } });
    if (!ticket) throw new NotFoundException(`Ticket with ID ${ticketId} not found`);
    if (ticket.status !== QueueStatus.CALLED) {
      throw new BadRequestException('Only CALLED tickets can start service');
    }

    ticket.status = QueueStatus.IN_PROGRESS;
    ticket.started_at = new Date();
    return this.ticketRepo.save(ticket);
  }

  async completeTicket(ticketId: string): Promise<QueueTicket> {
    const ticket = await this.ticketRepo.findOne({ where: { ticket_id: ticketId } });
    if (!ticket) throw new NotFoundException(`Ticket with ID ${ticketId} not found`);
    if (ticket.status !== QueueStatus.IN_PROGRESS) {
      throw new BadRequestException('Only IN_PROGRESS tickets can be completed');
    }

    ticket.status = QueueStatus.COMPLETED;
    ticket.completed_at = new Date();
    return this.ticketRepo.save(ticket);
  }

  async skipTicket(ticketId: string): Promise<QueueTicket> {
    const ticket = await this.ticketRepo.findOne({ where: { ticket_id: ticketId } });
    if (!ticket) throw new NotFoundException(`Ticket with ID ${ticketId} not found`);

    if (![QueueStatus.CALLED, QueueStatus.WAITING].includes(ticket.status)) {
      throw new BadRequestException('Only CALLED or WAITING tickets can be skipped');
    }

    ticket.status = QueueStatus.SKIPPED;
    ticket.completed_at = new Date();
    return this.ticketRepo.save(ticket);
  }

  async assignServices(ticketId: string, dto: AssignServicesDto): Promise<QueueTicket> {
    const ticket = await this.ticketRepo.findOne({ where: { ticket_id: ticketId } });
    if (!ticket) throw new NotFoundException(`Ticket with ID ${ticketId} not found`);

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
    return this.ticketRepo.save(ticket);
  }

  async update(id: string, dto: UpdateTicketDto): Promise<QueueTicket> {
    const ticket = await this.ticketRepo.findOne({ where: { ticket_id: id } });
    if (!ticket) throw new NotFoundException(`Ticket with ID ${id} not found`);

    Object.assign(ticket, dto);
    return this.ticketRepo.save(ticket);
  }
}
