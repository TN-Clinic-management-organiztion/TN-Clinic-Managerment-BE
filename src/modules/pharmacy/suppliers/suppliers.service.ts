import { DrugSupplier } from './../../../database/entities/pharmacy/drug_suppliers.entity';
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import {
  CreateSupplierDto,
  UpdateSupplierDto,
  QuerySupplierDto,
} from './dto/supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(DrugSupplier)
    private readonly supplierRepo: Repository<DrugSupplier>,
  ) {}

  async create(dto: CreateSupplierDto): Promise<DrugSupplier> {
    const supplier = this.supplierRepo.create(dto);
    return await this.supplierRepo.save(supplier);
  }

  async findAll(query: QuerySupplierDto) {
    const { page = 1, limit = 20, search, is_active } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (is_active !== undefined) {
      where.is_active = is_active;
    }

    if (search) {
      where.supplier_name = Like(`%${search}%`);
    }

    const [data, total] = await this.supplierRepo.findAndCount({
      where,
      skip,
      take: limit,
      order: {
        supplier_name: 'ASC',
      },
    });

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

  async findOne(id: number): Promise<DrugSupplier> {
    const supplier = await this.supplierRepo.findOne({
      where: { supplier_id: id },
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }

    return supplier;
  }

  async update(id: number, dto: UpdateSupplierDto): Promise<DrugSupplier> {
    const supplier = await this.findOne(id);
    Object.assign(supplier, dto);
    return await this.supplierRepo.save(supplier);
  }

  async remove(id: number): Promise<void> {
    const supplier = await this.findOne(id);

    // Kiểm tra có phiếu nhập nào liên quan không
    const importCount = await this.supplierRepo.manager
      .createQueryBuilder()
      .select('COUNT(*)', 'count')
      .from('drug_imports', 'di')
      .where('di.supplier_id = :id', { id })
      .getRawOne();

    if (parseInt(importCount.count) > 0) {
      throw new ConflictException(
        'Cannot delete supplier that has import records',
      );
    }

    await this.supplierRepo.remove(supplier);
  }

  async toggleActive(id: number): Promise<DrugSupplier> {
    const supplier = await this.findOne(id);
    supplier.is_active = !supplier.is_active;
    return await this.supplierRepo.save(supplier);
  }
}