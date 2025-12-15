import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import {
  CreateInvoiceDto,
  UpdateInvoiceDto,
  QueryInvoiceDto,
  AddInvoiceItemDto,
} from './dto/invoice.dto';
import { InvoiceStatus } from '../../../database/entities/finance/invoices.entity';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  /**
   * Tạo hóa đơn mới
   * POST /invoices
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateInvoiceDto) {
    return this.invoicesService.create(createDto);
  }

  /**
   * Lấy danh sách hóa đơn
   * GET /invoices?page=1&limit=20&status=UNPAID
   */
  @Get()
  findAll(@Query() query: QueryInvoiceDto) {
    return this.invoicesService.findAll(query);
  }

  /**
   * Lấy báo cáo doanh thu
   * GET /invoices/report/revenue?from_date=2024-01-01&to_date=2024-01-31
   */
  @Get('report/revenue')
  getRevenueReport(
    @Query('from_date') fromDate: string,
    @Query('to_date') toDate: string,
  ) {
    return this.invoicesService.getRevenueReport(fromDate, toDate);
  }

  /**
   * Lấy chi tiết hóa đơn
   * GET /invoices/:id
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.invoicesService.findOne(id);
  }

  /**
   * Thêm item vào hóa đơn
   * POST /invoices/:id/items
   */
  @Post(':id/items')
  @HttpCode(HttpStatus.CREATED)
  addItem(@Param('id') id: string, @Body() dto: AddInvoiceItemDto) {
    return this.invoicesService.addItem(id, dto);
  }

  /**
   * Cập nhật hóa đơn
   * PATCH /invoices/:id
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateInvoiceDto) {
    return this.invoicesService.update(id, updateDto);
  }

  /**
   * Cập nhật trạng thái hóa đơn
   * PATCH /invoices/:id/status
   */
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: InvoiceStatus) {
    return this.invoicesService.updateStatus(id, status);
  }

  /**
   * Xóa item khỏi hóa đơn
   * DELETE /invoices/items/:itemId
   */
  @Delete('items/:itemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeItem(@Param('itemId') itemId: string) {
    return this.invoicesService.removeItem(itemId);
  }

  /**
   * Xóa hóa đơn
   * DELETE /invoices/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.invoicesService.remove(id);
  }
}