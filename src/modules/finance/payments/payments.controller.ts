
import { CreatePaymentDto, QueryPaymentDto } from './dto/payments.dto';
import { PaymentsService } from './payments.service';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * Tạo payment cho invoice
   * POST /payments
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreatePaymentDto) {
    return this.paymentsService.create(createDto);
  }

  /**
   * Lấy danh sách payments
   * GET /payments?page=1&limit=20&invoice_id=xxx
   */
  @Get()
  findAll(@Query() query: QueryPaymentDto) {
    return this.paymentsService.findAll(query);
  }

  /**
   * Lấy báo cáo theo phương thức thanh toán
   * GET /payments/report/by-method?from_date=2024-01-01&to_date=2024-01-31
   */
  @Get('report/by-method')
  getPaymentMethodReport(
    @Query('from_date') fromDate: string,
    @Query('to_date') toDate: string,
  ) {
    return this.paymentsService.getPaymentMethodReport(fromDate, toDate);
  }

  /**
   * Lấy lịch sử thanh toán của invoice
   * GET /payments/invoice/:invoiceId
   */
  @Get('invoice/:invoiceId')
  findByInvoice(@Param('invoiceId') invoiceId: string) {
    return this.paymentsService.findByInvoice(invoiceId);
  }

  /**
   * Lấy chi tiết payment
   * GET /payments/:id
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }
}