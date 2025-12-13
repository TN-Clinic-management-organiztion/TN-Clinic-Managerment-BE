import { PartialType } from '@nestjs/mapped-types';
import { CreateOrgRoomDto } from 'src/modules/system/org_room/dto/create-room.dto';

export class UpdateOrgRoomDto extends PartialType(CreateOrgRoomDto) {}
