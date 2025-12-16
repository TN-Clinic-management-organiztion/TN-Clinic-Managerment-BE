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
import { LeavesService } from './leaves.service';
import {
  CreateLeaveDto,
  UpdateLeaveDto,
  QueryLeaveDto,
  ApproveLeaveDto,
} from './dto/leave.dto';

@Controller('leaves')
export class LeavesController {
  constructor(private readonly leavesService: LeavesService) {}

  /**
   * Tạo đơn xin nghỉ
   * POST /leaves
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateLeaveDto) {
    return this.leavesService.create(createDto);
  }

  /**
   * Lấy danh sách đơn xin nghỉ
   * GET /leaves?page=1&limit=20&status=PENDING
   */
  @Get()
  findAll(@Query() query: QueryLeaveDto) {
    return this.leavesService.findAll(query);
  }

  /**
   * Lấy thống kê nghỉ phép theo nhân viên
   * GET /leaves/stats/:staffId?year=2024
   */
  @Get('stats/:staffId')
  getLeaveStats(
    @Param('staffId') staffId: string,
    @Query('year', ParseIntPipe) year: number,
  ) {
    return this.leavesService.getLeaveStatsByStaff(staffId, year);
  }

  /**
   * Lấy chi tiết đơn xin nghỉ
   * GET /leaves/:id
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leavesService.findOne(id);
  }

  /**
   * Cập nhật đơn xin nghỉ
   * PATCH /leaves/:id
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateLeaveDto) {
    return this.leavesService.update(id, updateDto);
  }

  /**
   * Phê duyệt/Từ chối đơn xin nghỉ
   * POST /leaves/:id/approve
   */
  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  approve(@Param('id') id: string, @Body() approveDto: ApproveLeaveDto) {
    return this.leavesService.approve(id, approveDto);
  }

  /**
   * Xóa đơn xin nghỉ
   * DELETE /leaves/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.leavesService.remove(id);
  }
}