import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Config
import { ConfigController } from './config/config.controller';
import { ConfigService } from './config/config.service';
import { SystemConfig } from '../../database/entities/system/system_config.entity';

// Audit Logs
import { AuditLogsController } from './audit-logs/audit-logs.controller';
import { AuditLogsService } from './audit-logs/audit-logs.service';
import { SystemAuditLog } from '../../database/entities/system/system_audit_logs.entity';

// Notifications
import { NotificationsController } from './notifications/notifications.controller';
import { NotificationsService } from './notifications/notifications.service';
import { SystemNotification } from '../../database/entities/system/system_notifications.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Config
      SystemConfig,
      // Audit Logs
      SystemAuditLog,
      // Notifications
      SystemNotification,
    ]),
  ],
  controllers: [
    ConfigController,
    AuditLogsController,
    NotificationsController,
  ],
  providers: [
    ConfigService,
    AuditLogsService,
    NotificationsService,
  ],
  exports: [
    ConfigService,
    AuditLogsService,
    NotificationsService,
  ],
})
export class SystemModule {}