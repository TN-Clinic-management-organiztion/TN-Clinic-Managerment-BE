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
  ParseIntPipe,
} from '@nestjs/common';
import { SalaryConfigService } from './salary-config.service';
import {
  CreateSalaryConfigDto,
  UpdateSalaryConfigDto,
  QuerySalaryConfigDto,
} from './dto/salary-config.dto';

@Controller('salary-config')
export class SalaryConfigController {
  constructor(private readonly salaryConfigService: SalaryConfigService) {}

  /**
   * Tạo cấu hình lương mới
   * POST /salary-config
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateSalaryConfigDto) {
    return this.salaryConfigService.create(createDto);
  }

  /**
   * Lấy danh sách cấu hình lương
   * GET /salary-config?page=1&limit=20&staff_id=xxx
   */
  @Get()
  findAll(@Query() query: QuerySalaryConfigDto) {
    return this.salaryConfigService.findAll(query);
  }

  /**
   * Lấy cấu hình lương hiện tại của nhân viên
   * GET /salary-config/current/:staffId
   */
  @Get('current/:staffId')
  getCurrentConfig(@Param('staffId') staffId: string) {
    return this.salaryConfigService.getCurrentConfig(staffId);
  }

  /**
   * Lấy chi tiết cấu hình lương
   * GET /salary-config/:id
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.salaryConfigService.findOne(id);
  }

  /**
   * Cập nhật cấu hình lương
   * PATCH /salary-config/:id
   */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateSalaryConfigDto,
  ) {
    return this.salaryConfigService.update(id, updateDto);
  }

  /**
   * Xóa cấu hình lương
   * DELETE /salary-config/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.salaryConfigService.remove(id);
  }
}