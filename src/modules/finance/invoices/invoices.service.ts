import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Invoice, InvoiceStatus } from '../../../database/entities/finance/invoices.entity';
import { InvoiceItem } from '../../../database/entities/finance/invoice_items.entity';
import {
  CreateInvoiceDto,
  UpdateInvoiceDto,
  QueryInvoiceDto,
  AddInvoiceItemDto,
} from './dto/invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private readonly invoiceItemRepo: Repository<InvoiceItem>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Tạo hóa đơn mới
   */
  async create(dto: CreateInvoiceDto): Promise<Invoice> {
    return await this.dataSource.transaction(async (manager) => {
      // Validate encounter nếu có
      if (dto.encounter_id) {
        const encounterExists = await manager
          .createQueryBuilder()
          .select('1')
          .from('medical_encounters', 'e')
          .where('e.encounter_id = :id', { id: dto.encounter_id })
          .andWhere('e.deleted_at IS NULL')
          .getRawOne();

        if (!encounterExists) {
          throw new NotFoundException('Encounter not found');
        }
      }

      // Tạo invoice
      const invoice = manager.create(Invoice, {
        encounter_id: dto.encounter_id,
        cashier_id: dto.cashier_id,
        status: InvoiceStatus.DRAFT,
        total_amount: '0',
      });

      return await manager.save(invoice);
    });
  }

  /**
   * Thêm item vào hóa đơn
   */
  async addItem(invoiceId: string, dto: AddInvoiceItemDto) {
    return await this.dataSource.transaction(async (manager) => {
      const invoice = await manager.findOne(Invoice, {
        where: { invoice_id: invoiceId },
      });

      if (!invoice) {
        throw new NotFoundException(`Invoice ${invoiceId} not found`);
      }

      if (invoice.status === InvoiceStatus.PAID) {
        throw new BadRequestException('Cannot modify paid invoice');
      }

      // Tính line_amount
      const lineAmount = (
        parseFloat(dto.unit_price) * dto.quantity
      ).toFixed(2);

      // Tạo invoice item
      const item = manager.create(InvoiceItem, {
        invoice_id: invoiceId,
        item_type: dto.item_type,
        service_item_id: dto.service_item_id,
        prescription_detail_id: dto.prescription_detail_id,
        description: dto.description,
        quantity: dto.quantity,
        unit_price: dto.unit_price,
        line_amount: lineAmount,
      });

      await manager.save(item);

      // Cập nhật total_amount của invoice
      await this.recalculateTotal(manager, invoiceId);

      return item;
    });
  }

  /**
   * Tính lại tổng tiền của hóa đơn
   */
  private async recalculateTotal(manager: any, invoiceId: string) {
    const result = await manager
      .createQueryBuilder(InvoiceItem, 'item')
      .select('SUM(item.line_amount)', 'total')
      .where('item.invoice_id = :invoiceId', { invoiceId })
      .getRawOne();

    const total = result?.total || '0';

    await manager.update(Invoice, invoiceId, {
      total_amount: total,
    });
  }

  /**
   * Cập nhật trạng thái hóa đơn
   */
  async updateStatus(
    invoiceId: string,
    status: InvoiceStatus,
  ): Promise<Invoice> {
    const invoice = await this.invoiceRepo.findOne({
      where: { invoice_id: invoiceId },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice ${invoiceId} not found`);
    }

    invoice.status = status;

    if (status === InvoiceStatus.PAID) {
      invoice.payment_time = new Date();
    }

    return await this.invoiceRepo.save(invoice);
  }

  /**
   * Lấy danh sách hóa đơn
   */
  async findAll(query: QueryInvoiceDto) {
    const {
      page = 1,
      limit = 20,
      search,
      encounter_id,
      cashier_id,
      status,
      from_date,
      to_date,
    } = query;
    const skip = (page - 1) * limit;

    const qb = this.invoiceRepo
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.encounter', 'encounter')
      .leftJoinAndSelect('encounter.patient', 'patient')
      .leftJoinAndSelect('invoice.cashier', 'cashier');

    if (encounter_id) {
      qb.andWhere('invoice.encounter_id = :encounter_id', { encounter_id });
    }

    if (cashier_id) {
      qb.andWhere('invoice.cashier_id = :cashier_id', { cashier_id });
    }

    if (status) {
      qb.andWhere('invoice.status = :status', { status });
    }

    if (from_date) {
      qb.andWhere('invoice.created_at >= :from_date', {
        from_date: new Date(from_date),
      });
    }

    if (to_date) {
      qb.andWhere('invoice.created_at <= :to_date', {
        to_date: new Date(to_date),
      });
    }

    if (search) {
      qb.andWhere('patient.full_name ILIKE :search', {
        search: `%${search}%`,
      });
    }

    qb.orderBy('invoice.created_at', 'DESC');
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

  /**
   * Lấy chi tiết hóa đơn với items
   */
  async findOne(id: string) {
    const invoice = await this.invoiceRepo
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.encounter', 'encounter')
      .leftJoinAndSelect('encounter.patient', 'patient')
      .leftJoinAndSelect('invoice.cashier', 'cashier')
      .where('invoice.invoice_id = :id', { id })
      .getOne();

    if (!invoice) {
      throw new NotFoundException(`Invoice ${id} not found`);
    }

    // Lấy items
    const items = await this.invoiceItemRepo.find({
      where: { invoice_id: id },
      order: { invoice_item_id: 'ASC' },
    });

    return {
      ...invoice,
      items,
    };
  }

  /**
   * Cập nhật hóa đơn
   */
  async update(id: string, dto: UpdateInvoiceDto): Promise<Invoice> {
    const invoice = await this.invoiceRepo.findOne({
      where: { invoice_id: id },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice ${id} not found`);
    }

    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Cannot update paid invoice');
    }

    Object.assign(invoice, dto);

    return await this.invoiceRepo.save(invoice);
  }

  /**
   * Xóa item khỏi hóa đơn
   */
  async removeItem(itemId: string) {
    return await this.dataSource.transaction(async (manager) => {
      const item = await manager.findOne(InvoiceItem, {
        where: { invoice_item_id: itemId },
      });

      if (!item) {
        throw new NotFoundException(`Invoice item ${itemId} not found`);
      }

      const invoice = await manager.findOne(Invoice, {
        where: { invoice_id: item.invoice_id },
      });

      if (invoice?.status === InvoiceStatus.PAID) {
        throw new BadRequestException('Cannot modify paid invoice');
      }

      await manager.delete(InvoiceItem, itemId);

      // Tính lại tổng tiền
      await this.recalculateTotal(manager, item.invoice_id);
    });
  }

  /**
   * Soft delete hóa đơn
   */
  async remove(id: string): Promise<void> {
    const invoice = await this.invoiceRepo.findOne({
      where: { invoice_id: id },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice ${id} not found`);
    }

    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Cannot delete paid invoice');
    }

    invoice.deleted_at = new Date();
    await this.invoiceRepo.save(invoice);
  }

  /**
   * Báo cáo doanh thu theo ngày
   */
  async getRevenueReport(fromDate: string, toDate: string) {
    const result = await this.dataSource.query(
      `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as total_invoices,
        SUM(CAST(total_amount AS DECIMAL)) as total_revenue,
        COUNT(CASE WHEN status = 'PAID' THEN 1 END) as paid_count,
        SUM(CASE WHEN status = 'PAID' THEN CAST(total_amount AS DECIMAL) ELSE 0 END) as paid_revenue
      FROM invoices
      WHERE created_at >= $1 
        AND created_at < $2
        AND deleted_at IS NULL
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at)
      `,
      [new Date(fromDate), new Date(toDate)],
    );

    return result;
  }
}