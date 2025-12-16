import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, IsNull } from 'typeorm';
import { RefDrugCategory } from './../../../database/entities/pharmacy/ref_drug_categories.entity';
import { CreateDrugCategoryDto } from './dto/create-drug-category.dto';
import { UpdateDrugCategoryDto } from './dto/update-drug-category.dto';
import { QueryDrugCategoryDto } from './dto/query-drug-category.dto';

@Injectable()
export class DrugCategoriesService {
  constructor(
    @InjectRepository(RefDrugCategory)
    private readonly categoryRepo: Repository<RefDrugCategory>,
  ) {}

  async create(dto: CreateDrugCategoryDto): Promise<RefDrugCategory> {
    // Kiểm tra parent_id có tồn tại không
    if (dto.parent_id) {
      const parent = await this.categoryRepo.findOne({
        where: { category_id: dto.parent_id },
      });
      if (!parent) {
        throw new NotFoundException(
          `Parent category with ID ${dto.parent_id} not found`,
        );
      }
    }

    const category = this.categoryRepo.create(dto);
    return await this.categoryRepo.save(category);
  }

  async findAll(query: QueryDrugCategoryDto) {
    const { page = 1, limit = 20, search, parent_id } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Lọc theo parent_id
    if (parent_id !== undefined) {
      where.parent_id = parent_id === null ? IsNull() : parent_id;
    }

    // Tìm kiếm theo tên hoặc mã
    if (search) {
      where.category_name = Like(`%${search}%`);
    }

    const [data, total] = await this.categoryRepo.findAndCount({
      where,
      relations: ['parent'],
      skip,
      take: limit,
      order: {
        category_code: 'ASC',
        category_name: 'ASC',
      },
    });

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

  async findOne(id: number): Promise<RefDrugCategory> {
    const category = await this.categoryRepo.findOne({
      where: { category_id: id },
      relations: ['parent'],
    });

    if (!category) {
      throw new NotFoundException(`Drug category with ID ${id} not found`);
    }

    return category;
  }

  async findChildren(id: number): Promise<RefDrugCategory[]> {
    const parent = await this.findOne(id);

    return await this.categoryRepo.find({
      where: { parent_id: parent.category_id },
      relations: ['parent'],
      order: {
        category_code: 'ASC',
        category_name: 'ASC',
      },
    });
  }

  async findTree(): Promise<RefDrugCategory[]> {
    // Lấy tất cả categories gốc (không có parent)
    const rootCategories = await this.categoryRepo.find({
      where: { parent_id: IsNull() },
      order: {
        category_code: 'ASC',
        category_name: 'ASC',
      },
    });

    // Load children cho mỗi root category (recursive)
    for (const root of rootCategories) {
      await this.loadChildren(root);
    }

    return rootCategories;
  }

  private async loadChildren(category: RefDrugCategory): Promise<void> {
    const children = await this.categoryRepo.find({
      where: { parent_id: category.category_id },
      order: {
        category_code: 'ASC',
        category_name: 'ASC',
      },
    });

    if (children.length > 0) {
      (category as any).children = children;
      for (const child of children) {
        await this.loadChildren(child);
      }
    }
  }

  async update(
    id: number,
    dto: UpdateDrugCategoryDto,
  ): Promise<RefDrugCategory> {
    const category = await this.findOne(id);

    // Kiểm tra parent_id mới
    if (dto.parent_id !== undefined) {
      if (dto.parent_id !== null) {
        // Không cho phép category trở thành con của chính nó
        if (dto.parent_id === id) {
          throw new BadRequestException(
            'Category cannot be its own parent',
          );
        }

        // Kiểm tra parent có tồn tại không
        const parent = await this.categoryRepo.findOne({
          where: { category_id: dto.parent_id },
        });
        if (!parent) {
          throw new NotFoundException(
            `Parent category with ID ${dto.parent_id} not found`,
          );
        }

        // Kiểm tra không tạo vòng lặp (circular reference)
        const isDescendant = await this.isDescendant(dto.parent_id, id);
        if (isDescendant) {
          throw new BadRequestException(
            'Cannot set parent to one of its descendants (circular reference)',
          );
        }
      }
    }

    Object.assign(category, dto);
    return await this.categoryRepo.save(category);
  }

  private async isDescendant(
    parentId: number,
    childId: number,
  ): Promise<boolean> {
    const parent = await this.categoryRepo.findOne({
      where: { category_id: parentId },
    });

    if (!parent || !parent.parent_id) {
      return false;
    }

    if (parent.parent_id === childId) {
      return true;
    }

    return await this.isDescendant(parent.parent_id, childId);
  }

  async remove(id: number): Promise<void> {
    const category = await this.findOne(id);

    // Kiểm tra xem có category con không
    const children = await this.categoryRepo.count({
      where: { parent_id: id },
    });

    if (children > 0) {
      throw new ConflictException(
        'Cannot delete category that has child categories',
      );
    }

    // Kiểm tra xem có thuốc nào đang sử dụng category này không
    const drugsCount = await this.categoryRepo.manager
      .createQueryBuilder()
      .select('COUNT(*)', 'count')
      .from('ref_drugs', 'd')
      .where('d.category_id = :id', { id })
      .getRawOne();

    if (parseInt(drugsCount.count) > 0) {
      throw new ConflictException(
        'Cannot delete category that is being used by drugs',
      );
    }

    await this.categoryRepo.remove(category);
  }
}