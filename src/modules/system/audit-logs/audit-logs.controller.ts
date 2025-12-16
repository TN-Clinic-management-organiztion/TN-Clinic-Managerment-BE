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
import { AuditLogsService } from './audit-logs.service';
import { CreateAuditLogDto, QueryAuditLogDto } from './dto/audit-log.dto';

@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  /**
   * Tạo audit log
   * POST /audit-logs
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateAuditLogDto) {
    return this.auditLogsService.create(createDto);
  }

  /**
   * Lấy danh sách audit logs
   * GET /audit-logs?page=1&limit=20&user_id=xxx&action_type=CREATE
   */
  @Get()
  findAll(@Query() query: QueryAuditLogDto) {
    return this.auditLogsService.findAll(query);
  }

  /**
   * Lấy thống kê hoạt động của user
   * GET /audit-logs/user-stats/:userId?from_date=2024-01-01&to_date=2024-12-31
   */
  @Get('user-stats/:userId')
  getUserActivityStats(
    @Param('userId') userId: string,
    @Query('from_date') fromDate: string,
    @Query('to_date') toDate: string,
  ) {
    return this.auditLogsService.getUserActivityStats(
      userId,
      new Date(fromDate),
      new Date(toDate),
    );
  }

  /**
   * Lấy lịch sử thay đổi của một record
   * GET /audit-logs/record/:tableName/:recordId
   */
  @Get('record/:tableName/:recordId')
  findByRecord(
    @Param('tableName') tableName: string,
    @Param('recordId') recordId: string,
  ) {
    return this.auditLogsService.findByRecord(tableName, recordId);
  }

  /**
   * Lấy chi tiết audit log
   * GET /audit-logs/:id
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.auditLogsService.findOne(id);
  }
}