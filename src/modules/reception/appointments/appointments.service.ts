import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import {
  OnlineAppointment,
  AppointmentStatus,
} from '../../../database/entities/reception/online_appointments.entity';
import {
  CreateAppointmentDto,
  UpdateAppointmentDto,
  QueryAppointmentDto,
} from './dto/appointment.dto';
import {
  QueueSource,
  QueueStatus,
  QueueTicket,
  QueueTicketType,
} from '../../../database/entities/reception/queue_tickets.entity';
import { QueueCounter } from '../../../database/entities/reception/queue_counters.entity';
import { RoomType } from '../../../database/entities/auth/org_rooms.entity';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(OnlineAppointment)
    private readonly appointmentRepo: Repository<OnlineAppointment>,
    private readonly dataSource: DataSource,
  ) {}

  private truncateToDay(date: Date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private async ensurePatient(manager: EntityManager, patientId: string) {
    const patientExists = await manager
      .createQueryBuilder()
      .select('1')
      .from('patient_profiles', 'p')
      .where('p.patient_id = :id', { id: patientId })
      .andWhere('p.deleted_at IS NULL')
      .getRawOne();

    if (!patientExists) {
      throw new NotFoundException('Patient not found');
    }
  }

  private async ensureDoctor(manager: EntityManager, doctorId: string) {
    const doctorExists = await manager
      .createQueryBuilder()
      .select('1')
      .from('staff_profiles', 's')
      .where('s.staff_id = :id', { id: doctorId })
      .andWhere('s.deleted_at IS NULL')
      .getRawOne();

    if (!doctorExists) {
      throw new NotFoundException('Doctor not found');
    }
  }

  private async ensureRoom(manager: EntityManager, roomId: number) {
    const roomExists = await manager
      .createQueryBuilder()
      .select('1')
      .from('org_rooms', 'r')
      .where('r.room_id = :id', { id: roomId })
      .andWhere('r.is_active = true')
      .getRawOne();

    if (!roomExists) {
      throw new NotFoundException('Room not found');
    }
  }

  private async findCashierRoomId(manager: EntityManager): Promise<number> {
    const room = await manager
      .createQueryBuilder()
      .select('room_id')
      .from('org_rooms', 'r')
      .where('r.room_type = :type', { type: RoomType.CASHIER })
      .andWhere('r.is_active = true')
      .orderBy('r.room_id', 'ASC')
      .getRawOne<{ room_id: number }>();

    if (!room) {
      throw new NotFoundException('No CASHIER room configured');
    }

    return room.room_id;
  }

  private async getOrCreateCounter(
    manager: EntityManager,
    roomId: number,
    ticketType: QueueTicketType,
  ): Promise<QueueCounter> {
    const today = this.truncateToDay(new Date());

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
  ) {
    const counter = await this.getOrCreateCounter(manager, roomId, ticketType);
    counter.last_number += 1;
    await manager.getRepository(QueueCounter).save(counter);
    return counter.last_number;
  }

  async create(dto: CreateAppointmentDto): Promise<OnlineAppointment> {
    const appointmentDateTime = new Date(
      `${dto.appointment_date}T${dto.appointment_time}`,
    );
    const now = new Date();

    if (appointmentDateTime < now) {
      throw new BadRequestException('Cannot create appointment in the past');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      await this.ensurePatient(manager, dto.patient_id);

      if (dto.desired_room_id) {
        await this.ensureRoom(manager, dto.desired_room_id);
      }

      if (dto.desired_doctor_id) {
        await this.ensureDoctor(manager, dto.desired_doctor_id);
      }

      const appointmentEntity = manager
        .getRepository(OnlineAppointment)
        .create({
          ...dto,
          appointment_date: new Date(dto.appointment_date),
          status: AppointmentStatus.PENDING,
        });

      const savedAppointment = await manager.save(appointmentEntity);

      await queryRunner.commitTransaction();

      return this.findOne(savedAppointment.appointment_id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(query: QueryAppointmentDto) {
    const {
      page = 1,
      limit = 20,
      search,
      patient_id,
      appointment_date,
      desired_room_id,
      desired_doctor_id,
      status,
    } = query;
    const skip = (page - 1) * limit;

    const qb = this.appointmentRepo
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.patient', 'patient')
      .leftJoinAndSelect('appointment.desired_room', 'room')
      .leftJoinAndSelect('appointment.desired_doctor', 'doctor');

    if (patient_id) {
      qb.where('appointment.patient_id = :patient_id', { patient_id });
    }

    if (appointment_date) {
      qb.andWhere('appointment.appointment_date = :appointment_date', {
        appointment_date: new Date(appointment_date),
      });
    }

    if (desired_room_id) {
      qb.andWhere('appointment.desired_room_id = :desired_room_id', {
        desired_room_id,
      });
    }

    if (desired_doctor_id) {
      qb.andWhere('appointment.desired_doctor_id = :desired_doctor_id', {
        desired_doctor_id,
      });
    }

    if (status) {
      qb.andWhere('appointment.status = :status', { status });
    }

    if (search) {
      qb.andWhere(
        '(patient.full_name ILIKE :search OR appointment.symptoms ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    qb.orderBy('appointment.appointment_date', 'ASC');
    qb.addOrderBy('appointment.appointment_time', 'ASC');
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

  async findOne(id: string): Promise<OnlineAppointment> {
    const appointment = await this.appointmentRepo.findOne({
      where: { appointment_id: id },
      relations: ['patient', 'desired_room', 'desired_doctor'],
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    return appointment;
  }

  async update(
    id: string,
    dto: UpdateAppointmentDto,
  ): Promise<OnlineAppointment> {
    const appointment = await this.appointmentRepo.findOne({
      where: { appointment_id: id },
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    // Không cho phép update nếu đã check-in hoặc cancelled
    if (
      appointment.status === AppointmentStatus.CANCELLED ||
      appointment.status === AppointmentStatus.COMPLETED
    ) {
      throw new BadRequestException(
        'Cannot update cancelled or completed appointments',
      );
    }

    Object.assign(appointment, dto);

    if (dto.appointment_date) {
      appointment.appointment_date = new Date(dto.appointment_date);
    }

    return await this.appointmentRepo.save(appointment);
  }

  async confirm(id: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      const appointment = await manager
        .getRepository(OnlineAppointment)
        .findOne({
          where: { appointment_id: id },
        });

      if (!appointment || appointment.deleted_at) {
        throw new NotFoundException(`Appointment with ID ${id} not found`);
      }

      if (
        appointment.status === AppointmentStatus.CANCELLED ||
        appointment.status === AppointmentStatus.COMPLETED ||
        appointment.status === AppointmentStatus.NO_SHOW
      ) {
        throw new BadRequestException(
          `Cannot confirm appointment in status ${appointment.status}`,
        );
      }

      // Nếu đã có ticket thì không tạo nữa (idempotent)
      const existingTicket = await manager.getRepository(QueueTicket).findOne({
        where: { appointment_id: id },
      });

      if (!existingTicket) {
        const cashierRoomId = await this.findCashierRoomId(manager);

        const displayNumber = await this.incrementCounter(
          manager,
          cashierRoomId,
          QueueTicketType.REGISTRATION,
        );

        const ticket = manager.getRepository(QueueTicket).create({
          appointment_id: id,
          room_id: cashierRoomId,
          ticket_type: QueueTicketType.REGISTRATION,
          display_number: displayNumber,
          source: QueueSource.ONLINE,
          status: QueueStatus.WAITING,
          encounter_id: null,
        });

        await manager.save(ticket);
      }

      appointment.status = AppointmentStatus.CONFIRMED;
      await manager.save(appointment);

      await queryRunner.commitTransaction();
      const ticket = await this.dataSource.getRepository(QueueTicket).findOne({
        where: { appointment_id: id },
        relations: ['room', 'appointment'],
      });

      return {
        appointment: await this.findOne(id),
        ticket,
      };
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  async cancel(id: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      const appointment = await manager
        .getRepository(OnlineAppointment)
        .findOne({
          where: { appointment_id: id },
        });

      if (!appointment || appointment.deleted_at) {
        throw new NotFoundException(`Appointment with ID ${id} not found`);
      }

      if (appointment.status === AppointmentStatus.COMPLETED) {
        throw new BadRequestException('Cannot cancel completed appointment');
      }

      // cập nhật ticket nếu có
      const ticket = await manager.getRepository(QueueTicket).findOne({
        where: { appointment_id: id },
      });

      if (ticket) {
        if (ticket.status === QueueStatus.COMPLETED) {
          throw new BadRequestException(
            'Cannot cancel: ticket already completed',
          );
        }
        ticket.status = QueueStatus.SKIPPED;
        ticket.completed_at = new Date();
        await manager.save(ticket);
      }

      appointment.status = AppointmentStatus.CANCELLED;
      await manager.save(appointment);

      await queryRunner.commitTransaction();
      return this.findOne(id);
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  async markNoShow(id: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      const appointment = await manager
        .getRepository(OnlineAppointment)
        .findOne({
          where: { appointment_id: id },
        });

      if (!appointment || appointment.deleted_at) {
        throw new NotFoundException(`Appointment with ID ${id} not found`);
      }

      if (
        appointment.status === AppointmentStatus.CANCELLED ||
        appointment.status === AppointmentStatus.COMPLETED
      ) {
        throw new BadRequestException(
          `Cannot mark no-show for status ${appointment.status}`,
        );
      }

      const ticket = await manager.getRepository(QueueTicket).findOne({
        where: { appointment_id: id },
      });

      if (ticket) {
        if (ticket.status === QueueStatus.COMPLETED) {
          throw new BadRequestException(
            'Cannot no-show: ticket already completed',
          );
        }
        ticket.status = QueueStatus.SKIPPED;
        ticket.completed_at = new Date();
        await manager.save(ticket);
      }

      appointment.status = AppointmentStatus.NO_SHOW;
      await manager.save(appointment);

      await queryRunner.commitTransaction();
      return this.findOne(id);
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  async getTodayAppointments(roomId?: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const qb = this.appointmentRepo
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.patient', 'patient')
      .leftJoinAndSelect('appointment.desired_room', 'room')
      .leftJoinAndSelect('appointment.desired_doctor', 'doctor')
      .where('appointment.appointment_date >= :today', { today })
      .andWhere('appointment.appointment_date < :tomorrow', { tomorrow })
      .andWhere('appointment.status IN (:...statuses)', {
        statuses: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED],
      });

    if (roomId) {
      qb.andWhere('appointment.desired_room_id = :roomId', { roomId });
    }

    qb.orderBy('appointment.appointment_time', 'ASC');

    return await qb.getMany();
  }

  async remove(id: string): Promise<void> {
    const appointment = await this.appointmentRepo.findOne({
      where: { appointment_id: id },
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    // Soft delete
    appointment.deleted_at = new Date();
    await this.appointmentRepo.save(appointment);
  }
}
