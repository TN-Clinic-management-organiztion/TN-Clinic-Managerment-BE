import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemNotification } from '../../../database/entities/system/system_notifications.entity';
import {
  CreateNotificationDto,
  QueryNotificationDto,
  MarkAsReadDto,
} from './dto/notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(SystemNotification)
    private readonly notificationRepo: Repository<SystemNotification>,
  ) {}

  /**
   * Tạo thông báo
   */
  async create(dto: CreateNotificationDto): Promise<SystemNotification> {
    const notification = this.notificationRepo.create(dto);
    return await this.notificationRepo.save(notification);
  }

  /**
   * Gửi thông báo cho nhiều users
   */
  async createBulk(
    userIds: string[],
    dto: Omit<CreateNotificationDto, 'user_id'>,
  ): Promise<SystemNotification[]> {
    const notifications = userIds.map((userId) =>
      this.notificationRepo.create({
        ...dto,
        user_id: userId,
      }),
    );

    return await this.notificationRepo.save(notifications);
  }

  /**
   * Lấy danh sách thông báo
   */
  async findAll(query: QueryNotificationDto) {
    const {
      page = 1,
      limit = 20,
      user_id,
      notification_type,
      is_read,
      is_important,
    } = query;
    const skip = (page - 1) * limit;

    const qb = this.notificationRepo
      .createQueryBuilder('notification')
      .leftJoinAndSelect('notification.sender', 'sender')
      .where('notification.is_deleted = :is_deleted', { is_deleted: false });

    if (user_id) {
      qb.andWhere('notification.user_id = :user_id', { user_id });
    }

    if (notification_type) {
      qb.andWhere('notification.notification_type = :notification_type', {
        notification_type,
      });
    }

    if (is_read !== undefined) {
      qb.andWhere('notification.is_read = :is_read', { is_read });
    }

    if (is_important !== undefined) {
      qb.andWhere('notification.is_important = :is_important', {
        is_important,
      });
    }

    qb.orderBy('notification.created_at', 'DESC');
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
   * Lấy số lượng thông báo chưa đọc
   */
  async getUnreadCount(userId: string): Promise<number> {
    return await this.notificationRepo.count({
      where: {
        user_id: userId,
        is_read: false,
        is_deleted: false,
      },
    });
  }

  /**
   * Lấy chi tiết thông báo
   */
  async findOne(id: string): Promise<SystemNotification> {
    const notification = await this.notificationRepo.findOne({
      where: { notification_id: id },
      relations: ['sender'],
    });

    if (!notification) {
      throw new NotFoundException(`Notification ${id} not found`);
    }

    return notification;
  }

  /**
   * Đánh dấu đã đọc
   */
  async markAsRead(id: string): Promise<SystemNotification> {
    const notification = await this.findOne(id);

    if (!notification.is_read) {
      notification.is_read = true;
      notification.read_at = new Date();
      await this.notificationRepo.save(notification);
    }

    return notification;
  }

  /**
   * Đánh dấu nhiều thông báo đã đọc
   */
  async markMultipleAsRead(dto: MarkAsReadDto): Promise<void> {
    await this.notificationRepo.update(
      {
        notification_id: dto.notification_ids as any,
        user_id: dto.user_id,
      },
      {
        is_read: true,
        read_at: new Date(),
      },
    );
  }

  /**
   * Đánh dấu tất cả đã đọc
   */
  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepo.update(
      {
        user_id: userId,
        is_read: false,
      },
      {
        is_read: true,
        read_at: new Date(),
      },
    );
  }

  /**
   * Xóa thông báo (soft delete)
   */
  async remove(id: string): Promise<void> {
    const notification = await this.findOne(id);

    notification.is_deleted = true;
    await this.notificationRepo.save(notification);
  }

  /**
   * Xóa nhiều thông báo
   */
  async removeMultiple(ids: string[]): Promise<void> {
    await this.notificationRepo.update(
      {
        notification_id: ids as any,
      },
      {
        is_deleted: true,
      },
    );
  }
}