import { CreatePaymentDto, QueryPaymentDto } from './dto/payments.dto';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { InvoicePayment } from '../../../database/entities/finance/invoice_payments.entity';
import { Invoice, InvoiceStatus } from '../../../database/entities/finance/invoices.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(InvoicePayment)
    private readonly paymentRepo: Repository<InvoicePayment>,
    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Tạo payment cho invoice
   */
  async create(dto: CreatePaymentDto): Promise<InvoicePayment> {
    return await this.dataSource.transaction(async (manager) => {
      // Kiểm tra invoice tồn tại
      const invoice = await manager.findOne(Invoice, {
        where: { invoice_id: dto.invoice_id },
      });

      if (!invoice) {
        throw new NotFoundException(`Invoice ${dto.invoice_id} not found`);
      }

      if (invoice.status === InvoiceStatus.CANCELLED) {
        throw new BadRequestException('Cannot pay cancelled invoice');
      }

      // Tạo payment
      const payment = manager.create(InvoicePayment, {
        invoice_id: dto.invoice_id,
        payment_method_code: dto.payment_method_code,
        amount: dto.amount,
        transaction_ref: dto.transaction_ref,
        notes: dto.notes,
      });

      await manager.save(payment);

      // Tính tổng số tiền đã thanh toán
      const totalPaid = await this.calculateTotalPaid(
        manager,
        dto.invoice_id,
      );
      const totalAmount = parseFloat(invoice.total_amount || '0');

      // Cập nhật trạng thái invoice
      if (totalPaid >= totalAmount) {
        invoice.status = InvoiceStatus.PAID;
        invoice.payment_time = new Date();
      } else if (totalPaid > 0) {
        invoice.status = InvoiceStatus.PARTIAL;
      }

      await manager.save(invoice);

      return payment;
    });
  }

  /**
   * Tính tổng số tiền đã thanh toán cho invoice
   */
  private async calculateTotalPaid(
    manager: any,
    invoiceId: string,
  ): Promise<number> {
    const result = await manager
      .createQueryBuilder(InvoicePayment, 'payment')
      .select('SUM(CAST(payment.amount AS DECIMAL))', 'total')
      .where('payment.invoice_id = :invoiceId', { invoiceId })
      .getRawOne();

    return parseFloat(result?.total || '0');
  }

  /**
   * Lấy danh sách payments
   */
  async findAll(query: QueryPaymentDto) {
    const {
      page = 1,
      limit = 20,
      invoice_id,
      payment_method_code,
      from_date,
      to_date,
    } = query;
    const skip = (page - 1) * limit;

    const qb = this.paymentRepo
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.invoice', 'invoice')
      .leftJoinAndSelect('invoice.encounter', 'encounter')
      .leftJoinAndSelect('encounter.patient', 'patient')
      .leftJoinAndSelect('payment.payment_method', 'method');

    if (invoice_id) {
      qb.andWhere('payment.invoice_id = :invoice_id', { invoice_id });
    }

    if (payment_method_code) {
      qb.andWhere('payment.payment_method_code = :payment_method_code', {
        payment_method_code,
      });
    }

    if (from_date) {
      qb.andWhere('payment.paid_at >= :from_date', {
        from_date: new Date(from_date),
      });
    }

    if (to_date) {
      qb.andWhere('payment.paid_at <= :to_date', {
        to_date: new Date(to_date),
      });
    }

    qb.orderBy('payment.paid_at', 'DESC');
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
   * Lấy chi tiết payment
   */
  async findOne(id: string): Promise<InvoicePayment> {
    const payment = await this.paymentRepo.findOne({
      where: { payment_id: id },
      relations: ['invoice', 'payment_method'],
    });

    if (!payment) {
      throw new NotFoundException(`Payment ${id} not found`);
    }

    return payment;
  }

  /**
   * Lấy lịch sử thanh toán của invoice
   */
  async findByInvoice(invoiceId: string): Promise<InvoicePayment[]> {
    return await this.paymentRepo.find({
      where: { invoice_id: invoiceId },
      relations: ['payment_method'],
      order: { paid_at: 'ASC' },
    });
  }

  /**
   * Báo cáo thanh toán theo phương thức
   */
  async getPaymentMethodReport(fromDate: string, toDate: string) {
    const result = await this.dataSource.query(
      `
      SELECT 
        pm.method_name,
        pm.payment_method_code,
        COUNT(*) as transaction_count,
        SUM(CAST(p.amount AS DECIMAL)) as total_amount
      FROM invoice_payments p
      JOIN ref_payment_methods pm ON p.payment_method_code = pm.payment_method_code
      WHERE p.paid_at >= $1 
        AND p.paid_at < $2
      GROUP BY pm.method_name, pm.payment_method_code
      ORDER BY total_amount DESC
      `,
      [new Date(fromDate), new Date(toDate)],
    );

    return result;
  }
}