import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import {
  Invoice,
  InvoiceStatus,
} from '../../../database/entities/finance/invoices.entity';
import {
  InvoiceItem,
  InvoiceItemType,
} from '../../../database/entities/finance/invoice_items.entity';
import {
  CreateInvoiceDto,
  UpdateInvoiceDto,
  QueryInvoiceDto,
  AddInvoiceItemDto,
  GenerateInvoiceFromEncounterDto,
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
      const lineAmount = (parseFloat(dto.unit_price) * dto.quantity).toFixed(2);

      // Tạo invoice item
      const item = manager.create(InvoiceItem, {
        invoice_id: invoiceId,
        item_type: dto.item_type,
        service_item_id: dto.service_item_id,
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
    // console.log('invoiceId trong update status: ', invoiceId);
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
  async findOne(id: string, manager?: EntityManager) {
    // console.log('Id trong findOne: ', id);

    const invoiceRepo = manager
      ? manager.getRepository(Invoice)
      : this.invoiceRepo;
    const invoiceItemRepo = manager
      ? manager.getRepository(InvoiceItem)
      : this.invoiceItemRepo;

    const invoice = await invoiceRepo
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.encounter', 'encounter')
      .leftJoinAndSelect('encounter.patient', 'patient')
      .leftJoinAndSelect('invoice.cashier', 'cashier')
      .where('invoice.invoice_id = :id', { id })
      .andWhere('invoice.deleted_at IS NULL') // khuyến nghị
      .getOne();

    // console.log('invoice findone: ', invoice);

    if (!invoice) {
      throw new NotFoundException(`Invoice ${id} not found`);
    }

    const items = await invoiceItemRepo.find({
      where: { invoice_id: id },
      order: { invoice_item_id: 'ASC' },
    });

    return { ...invoice, items };
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

  /**
   * ✅ TỰ ĐỘNG TẠO INVOICE TỪ ENCOUNTER - ĐƠN GIẢN HÓA
   * Logic: Lấy TẤT CẢ items chưa thanh toán (services + drugs)
   * Không cần phân biệt include_consultation vì khám cũng là service thường
   */
  async generateInvoiceFromEncounter(dto: GenerateInvoiceFromEncounterDto) {
    // console.log('encounter: ', dto);
    return await this.dataSource.transaction(async (manager) => {
      // 1. Validate encounter exists
      const encounter = await manager
        .createQueryBuilder()
        .select('*')
        .from('medical_encounters', 'e')
        .where('e.encounter_id = :id', { id: dto.encounter_id })
        .andWhere('e.deleted_at IS NULL')
        .getRawOne();

      if (!encounter) {
        throw new NotFoundException('Encounter not found');
      }

      // 2. Create invoice (DRAFT)
      const invoice = manager.create(Invoice, {
        encounter_id: dto.encounter_id,
        cashier_id: dto.cashier_id,
        status: InvoiceStatus.DRAFT,
        total_amount: '0',
      });

      // console.log('invoice mới tạo: ', invoice);

      const savedInvoice = await manager.save(invoice);
      // console.log('savedInvoice mới tạo: ', savedInvoice);

      // 3. ✅ TỰ ĐỘNG THÊM TẤT CẢ ITEMS CHƯA THANH TOÁN
      const servicesAdded = await this.addUnpaidServices(
        manager,
        savedInvoice.invoice_id,
        dto.encounter_id,
      );

      // 4. Nếu không có gì để thanh toán
      if (servicesAdded === 0) {
        throw new BadRequestException('Không có mục nào cần thanh toán');
      }

      // 5. Recalculate total
      await this.recalculateTotal(manager, savedInvoice.invoice_id);

      // 6. Return invoice with items
      return await this.findOne(savedInvoice.invoice_id, manager);
    });
  }

  /**
   * ✅ THÊM CÁC DỊCH VỤ CHƯA THANH TOÁN (BAO GỒM CẢ KHÁM)
   */
  private async addUnpaidServices(
    manager: any,
    invoiceId: string,
    encounterId: string,
  ) {
    // console.log('invoiceId: ', invoiceId);
    const unpaidServices = await this.dataSource.query(
      `
  SELECT 
    'SERVICE' as item_type,
    sri.item_id,
    s.service_name as description,
    1 as quantity,
    COALESCE(s.unit_price, 0) as unit_price
  FROM service_request_items sri
  INNER JOIN service_requests sr ON sri.request_id = sr.request_id
  INNER JOIN ref_services s ON sri.service_id = s.service_id
  WHERE sr.encounter_id = $1
    AND sr.deleted_at IS NULL
    AND sr.payment_status IN ('UNPAID', 'PARTIALLY_PAID')
    AND NOT EXISTS (
      SELECT 1 FROM invoice_items ii
      WHERE ii.service_item_id = sri.item_id
    )
  `,
      [encounterId],
    );

    // console.log('unpaidServices: ', unpaidServices);

    for (const service of unpaidServices) {
      const item = manager.create(InvoiceItem, {
        invoice_id: invoiceId,
        item_type: InvoiceItemType.SERVICE,
        service_item_id: service.item_id,
        description: service.service_name,
        quantity: 1,
        unit_price: service.unit_price || '0',
        line_amount: service.unit_price || '0',
      });

      await manager.save(item);
    }

    return unpaidServices.length;
  }

  /**
   * ✅ LẤY DANH SÁCH ITEMS CHƯA THANH TOÁN (Dùng cho FE xem trước)
   */
  async getUnpaidItemsByEncounter(encounterId: string) {
    // Services chưa thanh toán
    const unpaidServices = await this.dataSource.query(
      `
  SELECT 
    'SERVICE' as item_type,
    sri.item_id,
    s.service_name as description,
    1 as quantity,
    COALESCE(s.unit_price, 0) as unit_price,
    sri.request_id
  FROM service_request_items sri
  INNER JOIN service_requests sr ON sri.request_id = sr.request_id
  INNER JOIN ref_services s ON sri.service_id = s.service_id
  WHERE sr.encounter_id = $1
    AND sr.deleted_at IS NULL
    AND sr.payment_status IN ('UNPAID', 'PARTIALLY_PAID')
    AND NOT EXISTS (
      SELECT 1 FROM invoice_items ii
      WHERE ii.service_item_id = sri.item_id
    )
  `,
      [encounterId],
    );


    const allUnpaidItems = [...unpaidServices,];

    const totalAmount = allUnpaidItems.reduce((sum, item) => {
      const price = parseFloat(item.unit_price || 0);
      const qty = parseInt(item.quantity || 1);
      return sum + price * qty;
    }, 0);

    return {
      encounter_id: encounterId,
      unpaid_items: allUnpaidItems,
      total_items: allUnpaidItems.length,
      total_amount: totalAmount.toFixed(2),
    };
  }

  /**
   * ✅ KIỂM TRA TRẠNG THÁI THANH TOÁN
   */
  async checkEncounterPaymentStatus(encounterId: string) {
    const unpaidItems = await this.getUnpaidItemsByEncounter(encounterId);

    return {
      encounter_id: encounterId,
      is_fully_paid: unpaidItems.total_items === 0,
      unpaid_items_count: unpaidItems.total_items,
      unpaid_amount: unpaidItems.total_amount,
    };
  }
}
