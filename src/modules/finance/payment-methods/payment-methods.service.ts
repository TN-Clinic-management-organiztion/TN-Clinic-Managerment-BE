import { CreatePaymentMethodDto, UpdatePaymentMethodDto } from './dto/payment-methods.dto';
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefPaymentMethod } from '../../../database/entities/finance/ref_payment_methods.entity';

@Injectable()
export class PaymentMethodsService {
  constructor(
    @InjectRepository(RefPaymentMethod)
    private readonly paymentMethodRepo: Repository<RefPaymentMethod>,
  ) {}

  /**
   * Tạo phương thức thanh toán mới
   */
  async create(dto: CreatePaymentMethodDto): Promise<RefPaymentMethod> {
    // Kiểm tra trùng code
    const existing = await this.paymentMethodRepo.findOne({
      where: { payment_method_code: dto.payment_method_code },
    });

    if (existing) {
      throw new ConflictException(
        `Payment method code '${dto.payment_method_code}' already exists`,
      );
    }

    const method = this.paymentMethodRepo.create(dto);
    return await this.paymentMethodRepo.save(method);
  }

  /**
   * Lấy danh sách tất cả phương thức thanh toán
   */
  async findAll(activeOnly: boolean = false): Promise<RefPaymentMethod[]> {
    const where = activeOnly ? { is_active: true } : {};
    return await this.paymentMethodRepo.find({
      where,
      order: { payment_method_code: 'ASC' },
    });
  }

  /**
   * Lấy chi tiết phương thức thanh toán
   */
  async findOne(code: string): Promise<RefPaymentMethod> {
    const method = await this.paymentMethodRepo.findOne({
      where: { payment_method_code: code },
    });

    if (!method) {
      throw new NotFoundException(`Payment method '${code}' not found`);
    }

    return method;
  }

  /**
   * Cập nhật phương thức thanh toán
   */
  async update(
    code: string,
    dto: UpdatePaymentMethodDto,
  ): Promise<RefPaymentMethod> {
    const method = await this.findOne(code);

    Object.assign(method, dto);

    return await this.paymentMethodRepo.save(method);
  }

  /**
   * Xóa phương thức thanh toán
   */
  async remove(code: string): Promise<void> {
    const result = await this.paymentMethodRepo.delete(code);

    if (result.affected === 0) {
      throw new NotFoundException(`Payment method '${code}' not found`);
    }
  }

  /**
   * Kích hoạt/Vô hiệu hóa phương thức thanh toán
   */
  async toggleActive(code: string): Promise<RefPaymentMethod> {
    const method = await this.findOne(code);
    method.is_active = !method.is_active;
    return await this.paymentMethodRepo.save(method);
  }
}