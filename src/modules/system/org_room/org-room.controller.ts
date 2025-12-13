import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { CreateOrgRoomDto } from 'src/modules/system/org_room/dto/create-room.dto';
import { UpdateOrgRoomDto } from 'src/modules/system/org_room/dto/update-room.dto';
import { OrgRoomsService } from 'src/modules/system/org_room/org-room.service';

@Controller('room')
export class OrgRoomsController {
  constructor(private readonly orgRoomsService: OrgRoomsService) {}

  @Post()
  // @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  async createOrgRoom(@Body() createOrgRoomDto: CreateOrgRoomDto) {
    return this.orgRoomsService.createOrgRoom(createOrgRoomDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrgRoomDto: UpdateOrgRoomDto,
  ) {
    return this.orgRoomsService.updateOrgRoom(id, updateOrgRoomDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.orgRoomsService.remove(id);
  }

  @Get()
  findAll() {
    return this.orgRoomsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.orgRoomsService.findOne(id);
  }
}
