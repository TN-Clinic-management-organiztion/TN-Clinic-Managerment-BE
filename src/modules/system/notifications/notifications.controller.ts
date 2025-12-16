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
import { NotificationsService } from './notifications.service';
import {
  CreateNotificationDto,
  QueryNotificationDto,
  MarkAsReadDto,
} from './dto/notification.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * Tạo thông báo
   * POST /notifications
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateNotificationDto) {
    return this.notificationsService.create(createDto);
  }

  /**
   * Lấy danh sách thông báo
   * GET /notifications?page=1&limit=20&user_id=xxx&is_read=false
   */
  @Get()
  findAll(@Query() query: QueryNotificationDto) {
    return this.notificationsService.findAll(query);
  }

  /**
   * Lấy số lượng thông báo chưa đọc
   * GET /notifications/unread-count/:userId
   */
  @Get('unread-count/:userId')
  getUnreadCount(@Param('userId') userId: string) {
    return this.notificationsService.getUnreadCount(userId);
  }

  /**
   * Lấy chi tiết thông báo
   * GET /notifications/:id
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notificationsService.findOne(id);
  }

  /**
   * Đánh dấu đã đọc
   * PATCH /notifications/:id/read
   */
  @Patch(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  /**
   * Đánh dấu nhiều thông báo đã đọc
   * POST /notifications/mark-read
   */
  @Post('mark-read')
  @HttpCode(HttpStatus.OK)
  markMultipleAsRead(@Body() dto: MarkAsReadDto) {
    return this.notificationsService.markMultipleAsRead(dto);
  }

  /**
   * Đánh dấu tất cả đã đọc
   * POST /notifications/mark-all-read/:userId
   */
  @Post('mark-all-read/:userId')
  @HttpCode(HttpStatus.OK)
  markAllAsRead(@Param('userId') userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }

  /**
   * Xóa thông báo
   * DELETE /notifications/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(id);
  }

  /**
   * Xóa nhiều thông báo
   * POST /notifications/bulk-delete
   */
  @Post('bulk-delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeMultiple(@Body('ids') ids: string[]) {
    return this.notificationsService.removeMultiple(ids);
  }
}