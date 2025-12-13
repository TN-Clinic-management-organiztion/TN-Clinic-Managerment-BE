import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrgRoom } from 'src/database/entities/auth/org_rooms.entity';
import { CreateOrgRoomDto } from 'src/modules/system/org_room/dto/create-room.dto';
import { UpdateOrgRoomDto } from 'src/modules/system/org_room/dto/update-room.dto';
import { Repository } from 'typeorm';

@Injectable()
export class OrgRoomsService {
  constructor(
    @InjectRepository(OrgRoom)
    private orgRoomRepository: Repository<OrgRoom>,
  ) {}

  async createOrgRoom(createOrgRoomDto: CreateOrgRoomDto): Promise<OrgRoom> {
    const newRoom = this.orgRoomRepository.create(createOrgRoomDto);
    return await this.orgRoomRepository.save(newRoom);
  }

  async findAll(): Promise<OrgRoom[]> {
    return await this.orgRoomRepository.find();
  }

  async findOne(id: number): Promise<OrgRoom> {
    const room = await this.orgRoomRepository.findOneBy({ room_id: id });
    if (!room) {
      throw new NotFoundException(`Không tìm thấy phòng có ID: ${id}`);
    }
    return room;
  }

  async updateOrgRoom(
    id: number,
    updateOrgRoomDto: UpdateOrgRoomDto,
  ): Promise<OrgRoom> {
    console.log('updateOrgRoomDto: ', updateOrgRoomDto);
    const room = await this.findOne(id); // Kiểm tra tồn tại trước
    const updatedRoom = this.orgRoomRepository.merge(room, updateOrgRoomDto);
    console.log('updatedRoom: ', updatedRoom);
    return await this.orgRoomRepository.save(updatedRoom);
  }

  async remove(id: number): Promise<void> {
    const result = await this.orgRoomRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Không tìm thấy phòng có ID: ${id} để xóa`);
    }
  }
}
