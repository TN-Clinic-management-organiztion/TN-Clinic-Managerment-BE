import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrgRoom } from 'src/database/entities/auth/org_rooms.entity';
import { OrgRoomsController } from 'src/modules/system/org_room/org-room.controller';
import { OrgRoomsService } from 'src/modules/system/org_room/org-room.service';

@Module({
  imports: [TypeOrmModule.forFeature([OrgRoom])],
  controllers: [OrgRoomsController],
  providers: [OrgRoomsService],
  exports: [OrgRoomsService],
})
export class OrgRoomsModule {}
