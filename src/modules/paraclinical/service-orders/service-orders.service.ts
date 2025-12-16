import { UpdateRequestItemDto } from './dto/update-request-item.dto';
import { QueryServiceRequestDto } from './dto/query-service-request.dto';
import { UpdateServiceRequestDto } from './dto/update-service-request.dto';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, IsNull } from 'typeorm';
import { ServiceRequest } from 'src/database/entities/service/service_requests.entity';
import { ServiceRequestItem } from 'src/database/entities/service/service_request_items.entity';

@Injectable()
export class ServiceOrdersService {
  constructor(
    @InjectRepository(ServiceRequest)
    private requestRepo: Repository<ServiceRequest>,
    @InjectRepository(ServiceRequestItem)
    private itemRepo: Repository<ServiceRequestItem>,
    private dataSource: DataSource,
  ) {}

  async createRequest(dto: CreateServiceRequestDto): Promise<ServiceRequest> {
    return await this.dataSource.transaction(async (manager) => {
      // Verify encounter exists
      const encounterExists = await manager.query(
        `SELECT 1 FROM medical_encounters WHERE encounter_id = $1 AND deleted_at IS NULL`,
        [dto.encounter_id],
      );

      if (!encounterExists.length) {
        throw new NotFoundException('Encounter not found');
      }

      // Verify doctor exists
      const doctorExists = await manager.query(
        `SELECT 1 FROM staff_profiles WHERE staff_id = $1 AND deleted_at IS NULL`,
        [dto.requesting_doctor_id],
      );

      if (!doctorExists.length) {
        throw new NotFoundException('Doctor not found');
      }

      // Create request
      const request = manager.create(ServiceRequest, {
        encounter_id: dto.encounter_id,
        requesting_doctor_id: dto.requesting_doctor_id,
        notes: dto.notes,
      });

      const savedRequest = await manager.save(request);

      // Create items
      if (dto.items && dto.items.length > 0) {
        for (const itemDto of dto.items) {
          // Verify service exists
          const serviceExists = await manager.query(
            `SELECT 1 FROM ref_services WHERE service_id = $1`,
            [itemDto.service_id],
          );

          if (!serviceExists.length) {
            throw new NotFoundException(
              `Service with ID ${itemDto.service_id} not found`,
            );
          }

          const item = manager.create(ServiceRequestItem, {
            request_id: savedRequest.request_id,
            service_id: itemDto.service_id,
          });

          await manager.save(item);
        }
      }

      return savedRequest;
    });
  }

  async findAllRequests(query: QueryServiceRequestDto) {
    const {
      page = 1,
      limit = 20,
      encounter_id,
      requesting_doctor_id,
      payment_status,
      created_from,
      created_to,
    } = query;

    const skip = (page - 1) * limit;
    const qb = this.requestRepo
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.encounter', 'encounter')
      .leftJoinAndSelect('request.requesting_doctor', 'doctor')
      .where('request.deleted_at IS NULL');

    if (encounter_id) {
      qb.andWhere('request.encounter_id = :encounter_id', { encounter_id });
    }

    if (requesting_doctor_id) {
      qb.andWhere('request.requesting_doctor_id = :requesting_doctor_id', {
        requesting_doctor_id,
      });
    }

    if (payment_status) {
      qb.andWhere('request.payment_status = :payment_status', {
        payment_status,
      });
    }

    if (created_from) {
      qb.andWhere('request.created_at >= :created_from', { created_from });
    }

    if (created_to) {
      qb.andWhere('request.created_at <= :created_to', { created_to });
    }

    qb.orderBy('request.created_at', 'DESC').skip(skip).take(limit);

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

  async findOneRequest(id: string): Promise<ServiceRequest> {
    const request = await this.requestRepo.findOne({
      where: { request_id: id, deleted_at: IsNull() },
      relations: ['encounter', 'requesting_doctor'],
    });

    if (!request) {
      throw new NotFoundException(`Service request with ID ${id} not found`);
    }

    return request;
  }

  async getRequestWithItems(id: string) {
    const request = await this.findOneRequest(id);

    const items = await this.itemRepo.find({
      where: { request_id: id },
      relations: ['service'],
    });

    return {
      ...request,
      items,
    };
  }

  async updateRequest(
    id: string,
    dto: UpdateServiceRequestDto,
  ): Promise<ServiceRequest> {
    const request = await this.findOneRequest(id);
    Object.assign(request, dto);
    return await this.requestRepo.save(request);
  }

  async removeRequest(id: string): Promise<void> {
    const request = await this.findOneRequest(id);
    request.deleted_at = new Date();
    await this.requestRepo.save(request);
  }

  // ==================== REQUEST ITEMS ====================
  async updateRequestItem(
    itemId: string,
    dto: UpdateRequestItemDto,
  ): Promise<ServiceRequestItem> {
    const item = await this.itemRepo.findOne({
      where: { item_id: itemId },
      relations: ['service'],
    });

    if (!item) {
      throw new NotFoundException(`Request item with ID ${itemId} not found`);
    }

    item.status = dto.status;
    return await this.itemRepo.save(item);
  }

  async removeRequestItem(itemId: string): Promise<void> {
    const item = await this.itemRepo.findOne({
      where: { item_id: itemId },
    });

    if (!item) {
      throw new NotFoundException(`Request item with ID ${itemId} not found`);
    }

    await this.itemRepo.remove(item);
  }

  async getRequestItemsByEncounter(encounterId: string) {
    return await this.itemRepo
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.service', 'service')
      .leftJoinAndSelect('item.request', 'request')
      .where('request.encounter_id = :encounterId', { encounterId })
      .andWhere('request.deleted_at IS NULL')
      .getMany();
  }

  async getPendingItems(roomId?: number) {
    const qb = this.itemRepo
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.service', 'service')
      .leftJoinAndSelect('item.request', 'request')
      .leftJoinAndSelect('request.encounter', 'encounter')
      .leftJoinAndSelect('encounter.patient', 'patient')
      .where('item.status = :status', { status: 'PENDING' })
      .andWhere('request.deleted_at IS NULL');

    if (roomId) {
      qb.innerJoin(
        'room_services',
        'rs',
        'rs.service_id = service.service_id AND rs.room_id = :roomId',
        { roomId },
      );
    }

    return await qb.orderBy('request.created_at', 'ASC').getMany();
  }
}