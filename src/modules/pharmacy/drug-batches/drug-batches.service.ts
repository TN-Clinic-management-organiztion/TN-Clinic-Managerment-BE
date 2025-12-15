import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan } from 'typeorm';
import { InventoryLocation } from './../../../database/entities/pharmacy/inventory_locations.entity';
import { DrugBatch } from './../../../database/entities/pharmacy/drug_batches.entity';
import {
  UpdateDrugBatchDto,
  QueryDrugBatchDto,
} from './dto/drug-batch.dto';

@Injectable()
export class DrugBatchesService {
  constructor(
    @InjectRepository(DrugBatch)
    private readonly batchRepo: Repository<DrugBatch>,
    @InjectRepository(InventoryLocation)
    private readonly locationRepo: Repository<InventoryLocation>,
  ) {}

  async findAll(query: QueryDrugBatchDto) {
    const {
      page = 1,
      limit = 20,
      search,
      drug_id,
      location_id,
      has_stock,
      is_expired,
      expiring_in_days,
    } = query;
    const skip = (page - 1) * limit;

    const qb = this.batchRepo
      .createQueryBuilder('batch')
      .leftJoinAndSelect('batch.drug', 'drug')
      .leftJoinAndSelect('batch.location', 'location')
      .leftJoinAndSelect('batch.import_detail', 'import_detail')
      .leftJoinAndSelect('import_detail.drug_import', 'drug_import');

    if (search) {
      qb.where(
        'drug.drug_name ILIKE :search OR batch.batch_number ILIKE :search',
        { search: `%${search}%` },
      );
    }

    if (drug_id) {
      qb.andWhere('batch.drug_id = :drug_id', { drug_id });
    }

    if (location_id) {
      qb.andWhere('batch.location_id = :location_id', { location_id });
    }

    if (has_stock) {
      qb.andWhere('batch.quantity_current > 0');
    }

    if (is_expired !== undefined) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (is_expired) {
        qb.andWhere('batch.expiry_date < :today', { today });
      } else {
        qb.andWhere('batch.expiry_date >= :today', { today });
      }
    }

    if (expiring_in_days) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const futureDate = new Date(today);
      futureDate.setDate(futureDate.getDate() + expiring_in_days);

      qb.andWhere('batch.expiry_date BETWEEN :today AND :futureDate', {
        today,
        futureDate,
      });
      qb.andWhere('batch.quantity_current > 0');
    }

    qb.orderBy('batch.expiry_date', 'ASC');
    qb.addOrderBy('batch.batch_id', 'ASC');
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

  async findOne(id: number): Promise<DrugBatch> {
    const batch = await this.batchRepo.findOne({
      where: { batch_id: id },
      relations: [
        'drug',
        'drug.category',
        'location',
        'import_detail',
        'import_detail.drug_import',
        'import_detail.drug_import.supplier',
      ],
    });

    if (!batch) {
      throw new NotFoundException(`Drug batch with ID ${id} not found`);
    }

    return batch;
  }

  async findAvailableBatchesForDrug(drugId: number): Promise<DrugBatch[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // FEFO: Lấy batches chưa hết hạn, còn hàng, sắp xếp theo hạn sử dụng
    return await this.batchRepo.find({
      where: {
        drug_id: drugId,
        quantity_current: MoreThan(0),
        expiry_date: MoreThan(today),
      },
      relations: ['drug', 'location'],
      order: {
        expiry_date: 'ASC',
        batch_id: 'ASC',
      },
    });
  }

  async getExpiredBatches(): Promise<DrugBatch[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await this.batchRepo.find({
      where: {
        expiry_date: LessThan(today),
        quantity_current: MoreThan(0),
      },
      relations: ['drug', 'location'],
      order: {
        expiry_date: 'ASC',
      },
    });
  }

  async getExpiringBatches(days: number = 30): Promise<DrugBatch[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + days);

    return await this.batchRepo
      .createQueryBuilder('batch')
      .leftJoinAndSelect('batch.drug', 'drug')
      .leftJoinAndSelect('batch.location', 'location')
      .where('batch.expiry_date BETWEEN :today AND :futureDate', {
        today,
        futureDate,
      })
      .andWhere('batch.quantity_current > 0')
      .orderBy('batch.expiry_date', 'ASC')
      .getMany();
  }

  async update(id: number, dto: UpdateDrugBatchDto): Promise<DrugBatch> {
    const batch = await this.findOne(id);

    // Validate location_id
    if (dto.location_id !== undefined && dto.location_id !== null) {
      const location = await this.locationRepo.findOne({
        where: { location_id: dto.location_id },
      });
      if (!location) {
        throw new NotFoundException(
          `Location with ID ${dto.location_id} not found`,
        );
      }
    }

    Object.assign(batch, dto);
    return await this.batchRepo.save(batch);
  }

  async getTotalStockByDrug(drugId: number): Promise<number> {
    const result = await this.batchRepo
      .createQueryBuilder('batch')
      .select('SUM(batch.quantity_current)', 'total')
      .where('batch.drug_id = :drugId', { drugId })
      .getRawOne();

    return parseInt(result.total || '0');
  }

  async getBatchHistory(batchId: number) {
    // Lấy lịch sử xuất kho của batch
    const batch = await this.findOne(batchId);

    const dispenses = await this.batchRepo.manager
      .createQueryBuilder()
      .select('pbd.*')
      .addSelect('pd.detail_id', 'detail_id')
      .addSelect('pd.prescription_id', 'prescription_id')
      .addSelect('p.status', 'prescription_status')
      .from('prescription_batch_dispenses', 'pbd')
      .innerJoin('prescription_details', 'pd', 'pd.detail_id = pbd.detail_id')
      .innerJoin('prescriptions', 'p', 'p.prescription_id = pd.prescription_id')
      .where('pbd.batch_id = :batchId', { batchId })
      .orderBy('pbd.dispensed_at', 'DESC')
      .getRawMany();

    return {
      batch,
      dispenses,
      total_dispensed: batch.quantity_initial - batch.quantity_current,
    };
  }
}