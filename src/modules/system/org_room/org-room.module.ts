import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrgRoomsService } from './org-room.service';
import { OrgRoomsController } from './org-room.controller';
import { OrgRoom } from '../../../database/entities/auth/org_rooms.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrgRoom])],
  controllers: [OrgRoomsController],
  providers: [OrgRoomsService],
  exports: [OrgRoomsService],
})
export class OrgRoomsModule {}