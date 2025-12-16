import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrgRoomsController } from 'src/modules/system/org_room/org-room.controller';
import { OrgRoomsModule } from 'src/modules/system/org_room/org-room.module';
import { ALL_ENTITIES } from 'src/shared/Tables/all_entities';

@Module({
  imports: [OrgRoomsModule],
  exports: [OrgRoomsModule],
})
export class SystemModule {}
