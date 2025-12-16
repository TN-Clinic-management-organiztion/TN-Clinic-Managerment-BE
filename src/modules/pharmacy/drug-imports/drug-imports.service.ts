import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { DrugSupplier } from './../../../database/entities/pharmacy/drug_suppliers.entity';
import { RefDrug } from './../../../database/entities/pharmacy/ref_drugs.entity';
import { DrugBatch } from './../../../database/entities/pharmacy/drug_batches.entity';
import { DrugImportDetail } from './../../../database/entities/pharmacy/drug_import_details.entity';
import { DrugImport } from './../../../database/entities/pharmacy/drug_imports.entity';
import {
  CreateDrugImportDto,
  UpdateDrugImportDto,
  QueryDrugImportDto,
} from './dto/drug-import.dto';

@Injectable()
export class DrugImportsService {
  constructor(
    @InjectRepository(DrugImport)
    private readonly importRepo: Repository<DrugImport>,
    @InjectRepository(DrugImportDetail)
    private readonly detailRepo: Repository<DrugImportDetail>,
    @InjectRepository(DrugBatch)
    private readonly batchRepo: Repository<DrugBatch>,
    @InjectRepository(RefDrug)
    private readonly drugRepo: Repository<RefDrug>,
    @InjectRepository(DrugSupplier)
    private readonly supplierRepo: Repository<DrugSupplier>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateDrugImportDto): Promise<DrugImport> {
    // Validate supplier_id
    if (dto.supplier_id) {
      const supplier = await this.supplierRepo.findOne({
        where: { supplier_id: dto.supplier_id },
      });
      if (!supplier) {
        throw new NotFoundException(
          `Supplier with ID ${dto.supplier_id} not found`,
        );
      }
    }

    // Validate drug_ids
    const drugIds = [...new Set(dto.details.map((d) => d.drug_id))];
    const drugs = await this.drugRepo.find({
      where: { drug_id: In(drugIds) },
    });
    if (drugs.length !== drugIds.length) {
      throw new BadRequestException('Some drugs not found');
    }

    // Validate expiry dates
    const today = new Date();
    for (const detail of dto.details) {
      const expiryDate = new Date(detail.expiry_date);
      if (expiryDate <= today) {
        throw new BadRequestException(
          `Drug ID ${detail.drug_id}: Expiry date must be in the future`,
        );
      }
    }

    // Tính tổng tiền
    const totalAmount = dto.details.reduce((sum, detail) => {
      return sum + detail.quantity * parseFloat(detail.unit_price);
    }, 0);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Tạo drug_import
      const drugImport = this.importRepo.create({
        import_date: dto.import_date
          ? new Date(dto.import_date)
          : new Date(),
        supplier_id: dto.supplier_id,
        imported_by: dto.imported_by,
        invoice_number: dto.invoice_number,
        notes: dto.notes,
        total_amount: totalAmount.toFixed(2),
      });
      const savedImport = await queryRunner.manager.save(drugImport);

      // 2. Tạo drug_import_details và drug_batches
      for (const detailDto of dto.details) {
        // Tạo detail
        const detail = this.detailRepo.create({
          import_id: savedImport.import_id,
          drug_id: detailDto.drug_id,
          batch_number: detailDto.batch_number,
          expiry_date: new Date(detailDto.expiry_date),
          quantity: detailDto.quantity,
          unit_price: detailDto.unit_price,
        });
        const savedDetail = await queryRunner.manager.save(detail);

        // Tự động tạo batch từ import detail
        const batch = this.batchRepo.create({
          import_detail_id: savedDetail.import_detail_id,
          drug_id: detailDto.drug_id,
          batch_number: detailDto.batch_number,
          expiry_date: new Date(detailDto.expiry_date),
          quantity_initial: detailDto.quantity,
          quantity_current: detailDto.quantity,
          is_opened_box: false,
        });
        await queryRunner.manager.save(batch);
      }

      await queryRunner.commitTransaction();

      // Load đầy đủ relations
      return await this.findOne(savedImport.import_id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(query: QueryDrugImportDto) {
    const {
      page = 1,
      limit = 20,
      search,
      supplier_id,
      from_date,
      to_date,
    } = query;
    const skip = (page - 1) * limit;

    const qb = this.importRepo
      .createQueryBuilder('import')
      .leftJoinAndSelect('import.supplier', 'supplier')
      .leftJoinAndSelect('import.importer', 'importer');

    if (search) {
      qb.where(
        'import.invoice_number ILIKE :search OR import.notes ILIKE :search',
        { search: `%${search}%` },
      );
    }

    if (supplier_id) {
      qb.andWhere('import.supplier_id = :supplier_id', { supplier_id });
    }

    if (from_date && to_date) {
      qb.andWhere('import.import_date BETWEEN :from_date AND :to_date', {
        from_date: new Date(from_date),
        to_date: new Date(to_date),
      });
    } else if (from_date) {
      qb.andWhere('import.import_date >= :from_date', {
        from_date: new Date(from_date),
      });
    } else if (to_date) {
      qb.andWhere('import.import_date <= :to_date', {
        to_date: new Date(to_date),
      });
    }

    qb.orderBy('import.import_date', 'DESC');
    qb.addOrderBy('import.created_at', 'DESC');
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

  async findOne(id: number): Promise<DrugImport> {
    const drugImport = await this.importRepo
      .createQueryBuilder('import')
      .leftJoinAndSelect('import.supplier', 'supplier')
      .leftJoinAndSelect('import.importer', 'importer')
      .where('import.import_id = :id', { id })
      .getOne();

    if (!drugImport) {
      throw new NotFoundException(`Drug import with ID ${id} not found`);
    }

    // Load details
    const details = await this.detailRepo.find({
      where: { import_id: id },
      relations: ['drug', 'drug.category'],
      order: { import_detail_id: 'ASC' },
    });

    (drugImport as any).details = details;

    return drugImport;
  }

  async getImportStatistics(from_date?: string, to_date?: string) {
    const qb = this.importRepo.createQueryBuilder('import');

    if (from_date && to_date) {
      qb.where('import.import_date BETWEEN :from_date AND :to_date', {
        from_date: new Date(from_date),
        to_date: new Date(to_date),
      });
    }

    const result = await qb
      .select('COUNT(import.import_id)', 'total_imports')
      .addSelect('SUM(import.total_amount::numeric)', 'total_amount')
      .getRawOne();

    return {
      total_imports: parseInt(result.total_imports || '0'),
      total_amount: parseFloat(result.total_amount || '0'),
    };
  }

  async update(id: number, dto: UpdateDrugImportDto): Promise<DrugImport> {
    const drugImport = await this.importRepo.findOne({
      where: { import_id: id },
    });

    if (!drugImport) {
      throw new NotFoundException(`Drug import with ID ${id} not found`);
    }

    if (dto.supplier_id !== undefined && dto.supplier_id !== null) {
      const supplier = await this.supplierRepo.findOne({
        where: { supplier_id: dto.supplier_id },
      });
      if (!supplier) {
        throw new NotFoundException(
          `Supplier with ID ${dto.supplier_id} not found`,
        );
      }
    }

    Object.assign(drugImport, {
      ...dto,
      import_date: dto.import_date
        ? new Date(dto.import_date)
        : drugImport.import_date,
    });

    await this.importRepo.save(drugImport);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const drugImport = await this.findOne(id);

    // Kiểm tra xem có batch nào đã xuất chưa
    const details = (drugImport as any).details || [];
    for (const detail of details) {
      const batches = await this.batchRepo.find({
        where: { import_detail_id: detail.import_detail_id },
      });

      for (const batch of batches) {
        if (batch.quantity_current < batch.quantity_initial) {
          throw new BadRequestException(
            `Cannot delete import: Batch ${batch.batch_id} has been partially dispensed`,
          );
        }
      }
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Xóa batches
      for (const detail of details) {
        await queryRunner.manager.delete(DrugBatch, {
          import_detail_id: detail.import_detail_id,
        });
      }

      // Xóa details
      await queryRunner.manager.delete(DrugImportDetail, {
        import_id: id,
      });

      // Xóa import
      await queryRunner.manager.delete(DrugImport, { import_id: id });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}