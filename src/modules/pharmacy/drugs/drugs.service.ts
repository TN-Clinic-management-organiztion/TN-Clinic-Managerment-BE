import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Not } from 'typeorm';
import { RefDrugCategory } from './../../../database/entities/pharmacy/ref_drug_categories.entity';
import { RefDrug } from './../../../database/entities/pharmacy/ref_drugs.entity';
import {
  CreateDrugDto,
  UpdateDrugDto,
  QueryDrugDto,
} from './dto/drug.dto';

@Injectable()
export class DrugsService {
  constructor(
    @InjectRepository(RefDrug)
    private readonly drugRepo: Repository<RefDrug>,
    @InjectRepository(RefDrugCategory)
    private readonly categoryRepo: Repository<RefDrugCategory>,
  ) {}

  async create(dto: CreateDrugDto): Promise<RefDrug> {
    if (dto.category_id) {
      const category = await this.categoryRepo.findOne({
        where: { category_id: dto.category_id },
      });
      if (!category) {
        throw new NotFoundException(
          `Drug category with ID ${dto.category_id} not found`,
        );
      }
    }

    if (dto.drug_code) {
      const existing = await this.drugRepo.findOne({
        where: { drug_code: dto.drug_code },
      });
      if (existing) {
        throw new ConflictException(
          `Drug with code "${dto.drug_code}" already exists`,
        );
      }
    }

    const drug = this.drugRepo.create(dto);
    return await this.drugRepo.save(drug);
  }

  async findAll(query: QueryDrugDto) {
    const {
      page = 1,
      limit = 20,
      search,
      category_id,
      is_active,
      dosage_form,
      route,
    } = query;
    const skip = (page - 1) * limit;

    const qb = this.drugRepo
      .createQueryBuilder('drug')
      .leftJoinAndSelect('drug.category', 'category');

    if (search) {
      qb.where(
        'drug.drug_name ILIKE :search OR drug.active_ingredient ILIKE :search OR drug.drug_code ILIKE :search',
        { search: `%${search}%` },
      );
    }

    if (category_id !== undefined) {
      qb.andWhere('drug.category_id = :category_id', { category_id });
    }

    if (is_active !== undefined) {
      qb.andWhere('drug.is_active = :is_active', { is_active });
    }

    if (dosage_form) {
      qb.andWhere('drug.dosage_form = :dosage_form', { dosage_form });
    }

    if (route) {
      qb.andWhere('drug.route = :route', { route });
    }

    qb.orderBy('drug.drug_name', 'ASC');
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

  async findOne(id: number): Promise<RefDrug> {
    const drug = await this.drugRepo.findOne({
      where: { drug_id: id },
      relations: ['category'],
    });

    if (!drug) {
      throw new NotFoundException(`Drug with ID ${id} not found`);
    }

    return drug;
  }

  async getCurrentStock(drugId: number): Promise<number> {
    const result = await this.drugRepo.manager
      .createQueryBuilder()
      .select('SUM(batch.quantity_current)', 'total')
      .from('drug_batches', 'batch')
      .where('batch.drug_id = :drugId', { drugId })
      .getRawOne();

    return parseInt(result.total || '0');
  }

  async getLowStockDrugs(): Promise<any[]> {
    const drugs = await this.drugRepo
      .createQueryBuilder('drug')
      .leftJoinAndSelect('drug.category', 'category')
      .where('drug.reorder_level IS NOT NULL')
      .andWhere('drug.is_active = true')
      .getMany();

    const lowStockDrugs : any[] = [];

    for (const drug of drugs) {
      const currentStock = await this.getCurrentStock(drug.drug_id);
      if (currentStock < (drug.reorder_level || 0)) {
        lowStockDrugs.push({
          ...drug,
          current_stock: currentStock,
          shortage: (drug.reorder_level || 0) - currentStock,
        });
      }
    }

    return lowStockDrugs;
  }

  async update(id: number, dto: UpdateDrugDto): Promise<RefDrug> {
    const drug = await this.findOne(id);

    if (dto.category_id !== undefined && dto.category_id !== null) {
      const category = await this.categoryRepo.findOne({
        where: { category_id: dto.category_id },
      });
      if (!category) {
        throw new NotFoundException(
          `Drug category with ID ${dto.category_id} not found`,
        );
      }
    }

    if (dto.drug_code && dto.drug_code !== drug.drug_code) {
      const existing = await this.drugRepo.findOne({
        where: { drug_code: dto.drug_code, drug_id: Not(id) },
      });
      if (existing) {
        throw new ConflictException(
          `Drug with code "${dto.drug_code}" already exists`,
        );
      }
    }

    Object.assign(drug, dto);
    return await this.drugRepo.save(drug);
  }

  async remove(id: number): Promise<void> {
    const drug = await this.findOne(id);

    const batchCount = await this.drugRepo.manager
      .createQueryBuilder()
      .select('COUNT(*)', 'count')
      .from('drug_batches', 'b')
      .where('b.drug_id = :id', { id })
      .getRawOne();

    if (parseInt(batchCount.count) > 0) {
      throw new ConflictException(
        'Cannot delete drug that has batch records',
      );
    }

    await this.drugRepo.remove(drug);
  }

  async toggleActive(id: number): Promise<RefDrug> {
    const drug = await this.findOne(id);
    drug.is_active = !drug.is_active;
    return await this.drugRepo.save(drug);
  }
}