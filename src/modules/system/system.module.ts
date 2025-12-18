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
import { OrgRoom } from 'src/database/entities/auth/org_rooms.entity';
import { OrgRoomsController } from 'src/modules/system/org_room/org-room.controller';
import { OrgRoomsService } from 'src/modules/system/org_room/org-room.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Config
      SystemConfig,
      // Audit Logs
      SystemAuditLog,
      // Notifications
      SystemNotification,
      // Org Room
      OrgRoom
      
    ]),
  ],
  controllers: [
    ConfigController,
    AuditLogsController,
    NotificationsController,
    OrgRoomsController
  ],
  providers: [
    ConfigService,
    AuditLogsService,
    NotificationsService,
    OrgRoomsService
  ],
  exports: [
    ConfigService,
    AuditLogsService,
    NotificationsService,
    OrgRoomsService
  ],
})
export class SystemModule {}