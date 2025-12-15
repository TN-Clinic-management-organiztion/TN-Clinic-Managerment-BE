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
  ParseBoolPipe,
} from '@nestjs/common';
import { PaymentMethodsService } from './payment-methods.service';
import {
  CreatePaymentMethodDto,
  UpdatePaymentMethodDto,
} from './dto/payment-methods.dto';

@Controller('payment-methods')
export class PaymentMethodsController {
  constructor(
    private readonly paymentMethodsService: PaymentMethodsService,
  ) {}

  /**
   * Tạo phương thức thanh toán mới
   * POST /payment-methods
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreatePaymentMethodDto) {
    return this.paymentMethodsService.create(createDto);
  }

  /**
   * Lấy danh sách phương thức thanh toán
   * GET /payment-methods?activeOnly=true
   */
  @Get()
  findAll(@Query('activeOnly', new ParseBoolPipe({ optional: true })) activeOnly?: boolean) {
    return this.paymentMethodsService.findAll(activeOnly);
  }

  /**
   * Lấy chi tiết phương thức thanh toán
   * GET /payment-methods/:code
   */
  @Get(':code')
  findOne(@Param('code') code: string) {
    return this.paymentMethodsService.findOne(code);
  }

  /**
   * Cập nhật phương thức thanh toán
   * PATCH /payment-methods/:code
   */
  @Patch(':code')
  update(
    @Param('code') code: string,
    @Body() updateDto: UpdatePaymentMethodDto,
  ) {
    return this.paymentMethodsService.update(code, updateDto);
  }

  /**
   * Kích hoạt/Vô hiệu hóa phương thức thanh toán
   * PATCH /payment-methods/:code/toggle-active
   */
  @Patch(':code/toggle-active')
  toggleActive(@Param('code') code: string) {
    return this.paymentMethodsService.toggleActive(code);
  }

  /**
   * Xóa phương thức thanh toán
   * DELETE /payment-methods/:code
   */
  @Delete(':code')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('code') code: string) {
    return this.paymentMethodsService.remove(code);
  }
}