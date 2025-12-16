import { InventoryLocation } from './../../../database/entities/pharmacy/inventory_locations.entity';
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import {
  CreateInventoryLocationDto,
  UpdateInventoryLocationDto,
  QueryInventoryLocationDto,
} from './dto/inventory-location.dto';

@Injectable()
export class InventoryLocationsService {
  constructor(
    @InjectRepository(InventoryLocation)
    private readonly locationRepo: Repository<InventoryLocation>,
  ) {}

  async create(dto: CreateInventoryLocationDto): Promise<InventoryLocation> {
    // Kiểm tra path đã tồn tại chưa
    const existing = await this.locationRepo.findOne({
      where: { path: dto.path },
    });

    if (existing) {
      throw new ConflictException(
        `Location with path "${dto.path}" already exists`,
      );
    }

    // Kiểm tra parent path có tồn tại không (nếu không phải root)
    const pathParts = dto.path.split('.');
    if (pathParts.length > 1) {
      const parentPath = pathParts.slice(0, -1).join('.');
      const parent = await this.locationRepo.findOne({
        where: { path: parentPath },
      });

      if (!parent) {
        throw new BadRequestException(
          `Parent path "${parentPath}" does not exist`,
        );
      }
    }

    const location = this.locationRepo.create(dto);
    return await this.locationRepo.save(location);
  }

  async findAll(query: QueryInventoryLocationDto) {
    const { page = 1, limit = 20, search, parent_path } = query;
    const skip = (page - 1) * limit;

    const qb = this.locationRepo.createQueryBuilder('loc');

    // Tìm kiếm theo tên hoặc path
    if (search) {
      qb.where(
        'loc.location_name ILIKE :search OR loc.path::text ILIKE :search',
        { search: `%${search}%` },
      );
    }

    // Lọc theo parent path sử dụng ltree operators
    if (parent_path) {
      qb.andWhere('loc.path <@ :parent_path::ltree', { parent_path });
      qb.andWhere('loc.path != :parent_path::ltree', { parent_path });
    }

    qb.orderBy('loc.path', 'ASC');
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

  async findOne(id: number): Promise<InventoryLocation> {
    const location = await this.locationRepo.findOne({
      where: { location_id: id },
    });

    if (!location) {
      throw new NotFoundException(`Location with ID ${id} not found`);
    }

    return location;
  }

  async findByPath(path: string): Promise<InventoryLocation> {
    const location = await this.locationRepo.findOne({ where: { path } });

    if (!location) {
      throw new NotFoundException(`Location with path "${path}" not found`);
    }

    return location;
  }

  async findChildren(id: number): Promise<InventoryLocation[]> {
    const parent = await this.findOne(id);

    // Sử dụng ltree operator <@ để tìm tất cả con cháu
    return await this.locationRepo
      .createQueryBuilder('loc')
      .where('loc.path <@ :parent_path::ltree', {
        parent_path: parent.path,
      })
      .andWhere('loc.path != :parent_path::ltree', {
        parent_path: parent.path,
      })
      .orderBy('loc.path', 'ASC')
      .getMany();
  }

  async findTree(): Promise<any[]> {
    // Lấy tất cả locations
    const allLocations = await this.locationRepo.find({
      order: { path: 'ASC' },
    });

    // Xây dựng cấu trúc cây
    const tree: any[] = [];
    const pathMap = new Map();

    for (const loc of allLocations) {
      const item = {
        ...loc,
        children: [],
      };
      pathMap.set(loc.path, item);

      const pathParts = loc.path.split('.');
      if (pathParts.length === 1) {
        // Root level
        tree.push(item);
      } else {
        // Child level
        const parentPath = pathParts.slice(0, -1).join('.');
        const parent = pathMap.get(parentPath);
        if (parent) {
          parent.children.push(item);
        }
      }
    }

    return tree;
  }

  async update(
    id: number,
    dto: UpdateInventoryLocationDto,
  ): Promise<InventoryLocation> {
    const location = await this.findOne(id);

    // Nếu update path, kiểm tra path mới
    if (dto.path && dto.path !== location.path) {
      const existing = await this.locationRepo.findOne({
        where: { path: dto.path },
      });

      if (existing) {
        throw new ConflictException(
          `Location with path "${dto.path}" already exists`,
        );
      }

      // Kiểm tra có location con không
      const children = await this.locationRepo
        .createQueryBuilder('loc')
        .where('loc.path <@ :parent_path::ltree', {
          parent_path: location.path,
        })
        .andWhere('loc.path != :parent_path::ltree', {
          parent_path: location.path,
        })
        .getCount();

      if (children > 0) {
        throw new BadRequestException(
          'Cannot change path of location that has children',
        );
      }
    }

    Object.assign(location, dto);
    return await this.locationRepo.save(location);
  }

  async remove(id: number): Promise<void> {
    const location = await this.findOne(id);

    // Kiểm tra có location con không
    const children = await this.locationRepo
      .createQueryBuilder('loc')
      .where('loc.path <@ :parent_path::ltree', {
        parent_path: location.path,
      })
      .andWhere('loc.path != :parent_path::ltree', {
        parent_path: location.path,
      })
      .getCount();

    if (children > 0) {
      throw new ConflictException(
        'Cannot delete location that has child locations',
      );
    }

    // Kiểm tra có batch nào đang sử dụng không
    const batchCount = await this.locationRepo.manager
      .createQueryBuilder()
      .select('COUNT(*)', 'count')
      .from('drug_batches', 'b')
      .where('b.location_id = :id', { id })
      .getRawOne();

    if (parseInt(batchCount.count) > 0) {
      throw new ConflictException(
        'Cannot delete location that is being used by drug batches',
      );
    }

    await this.locationRepo.remove(location);
  }
}