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
import { CreateConfigDto, UpdateConfigDto, QueryConfigDto } from './dto/config.dto';
import { ConfigService } from 'src/modules/system/config/config.service';

@Controller('system-config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Tạo cấu hình mới
   * POST /system-config
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateConfigDto) {
    return this.configService.create(createDto);
  }

  /**
   * Lấy danh sách cấu hình
   * GET /system-config?page=1&limit=20&config_type=GENERAL
   */
  @Get()
  findAll(@Query() query: QueryConfigDto) {
    return this.configService.findAll(query);
  }

  /**
   * Lấy cấu hình theo type
   * GET /system-config/by-type/:type
   */
  @Get('by-type/:type')
  findByType(@Param('type') type: string) {
    return this.configService.findByType(type);
  }

  /**
   * Lấy giá trị cấu hình
   * GET /system-config/:key/value
   */
  @Get(':key/value')
  getValue(@Param('key') key: string) {
    return this.configService.getValue(key);
  }

  /**
   * Lấy cấu hình theo key
   * GET /system-config/:key
   */
  @Get(':key')
  findByKey(@Param('key') key: string) {
    return this.configService.findByKey(key);
  }

  /**
   * Cập nhật cấu hình
   * PATCH /system-config/:key
   */
  @Patch(':key')
  update(@Param('key') key: string, @Body() updateDto: UpdateConfigDto) {
    return this.configService.update(key, updateDto);
  }

  /**
   * Xóa cấu hình
   * DELETE /system-config/:key
   */
  @Delete(':key')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('key') key: string) {
    return this.configService.remove(key);
  }
}