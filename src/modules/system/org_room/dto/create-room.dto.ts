import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { RoomType } from 'src/database/entities/auth/org_rooms.entity';

export class CreateOrgRoomDto {
  @IsNotEmpty()
  @IsString()
  room_name: string;

  @IsOptional()
  @IsEnum(RoomType, { message: 'Loại phòng không phù hợp' })
  room_type?: RoomType;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
