import { RefIcd10 } from './../../../database/entities/clinical/ref_icd10.entity';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Like, Repository, DataSource } from 'typeorm';
import { CreateIcd10Dto } from './dto/create-icd10.dto';
import { UpdateIcd10Dto } from './dto/update-icd10.dto';
import { FilterIcd10Dto } from './dto/filter-icd10.dto';

@Injectable()
export class Icd10Service {
  constructor(
    @InjectRepository(RefIcd10)
    private readonly icd10Repository: Repository<RefIcd10>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  // 1. TẠO MỚI
  async create(createIcd10Dto: CreateIcd10Dto): Promise<RefIcd10> {
    return await this.dataSource.transaction(async (manager) => {
      // A. Kiểm tra trùng mã (Check Duplicate)
      const existing = await manager.findOne(RefIcd10, {
        where: { icd_code: createIcd10Dto.icd_code },
      });
      if (existing) {
        throw new ConflictException(
          `Mã ICD '${createIcd10Dto.icd_code}' đã tồn tại.`,
        );
      }

      // B. Xử lý Logic Cha - Con
      if (createIcd10Dto.parent_code) {
        const parent = await manager.findOne(RefIcd10, {
          where: { icd_code: createIcd10Dto.parent_code },
        });

        if (!parent) {
          throw new NotFoundException(
            `Mã cha '${createIcd10Dto.parent_code}' không tồn tại.`,
          );
        }
        // Nếu cha đang là leaf (True) -> Cập nhật thành False
        if (parent.is_leaf === true) {
          await manager.update(RefIcd10, parent.icd_code, { is_leaf: false });
        }
        // Nếu người dùng không gửi level, ta lấy level cha + 1
        if (!createIcd10Dto.level) {
          createIcd10Dto.level = (parent.level || 0) + 1;
        }
      }
      // C. Tạo con mới
      // Mặc định con mới tạo ra sẽ là Leaf (is_leaf = true)
      const newItem = manager.create(RefIcd10, {
        ...createIcd10Dto,
        is_leaf: true,
      });

      return await manager.save(newItem);
    });
  }

  // 2. LẤY DANH SÁCH CÓ PHÂN TRANG (PAGINATION & SEARCH)
  async findAll(query: FilterIcd10Dto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;
    const keyword = query.search?.trim();

    // Điều kiện tìm kiếm: Tìm theo Code hoặc Tên (Vi/En)
    const whereCondition = keyword
      ? [
          { icd_code: Like(`%${keyword}%`) },
          { name_vi: Like(`%${keyword}%`) },
          { name_en: Like(`%${keyword}%`) },
        ]
      : {};

    const [result, total] = await this.icd10Repository.findAndCount({
      where: whereCondition,
      order: { icd_code: 'ASC' },
      take: limit,
      skip: skip,
    });

    // Tính toán meta data cho frontend
    const lastPage = Math.ceil(total / limit);
    const nextPage = page + 1 > lastPage ? null : page + 1;
    const prevPage = page - 1 < 1 ? null : page - 1;

    return {
      data: result,
      meta: {
        total,
        page,
        last_page: lastPage,
        next_page: nextPage,
        prev_page: prevPage,
      },
    };
  }

  // 3. LẤY CHI TIẾT 1 BỆNH (FIND ONE)
  async findOne(code: string): Promise<RefIcd10> {
    const item = await this.icd10Repository.findOne({
      where: { icd_code: code },
      relations: ['parent'],
    });

    if (!item) {
      throw new NotFoundException(`Không tìm thấy ICD code: ${code}`);
    }
    return item;
  }

  // 4. LẤY DANH SÁCH CON (FIND CHILDREN) - NEW
  async findChildren(parentCode: string): Promise<RefIcd10[]> {
    // Kiểm tra cha có tồn tại không trước (Tuỳ chọn, nhưng nên làm để báo lỗi rõ ràng)
    await this.findOne(parentCode);

    return await this.icd10Repository.find({
      where: { parent_code: parentCode },
      order: { icd_code: 'ASC' },
    });
  }

  // 5. CẬP NHẬT (UPDATE) - ĐÃ TỐI ƯU VỚI CASCADE
  async update(
    code: string,
    updateIcd10Dto: UpdateIcd10Dto,
  ): Promise<RefIcd10> {
    return await this.dataSource.transaction(async (manager) => {
      // B1: Lấy thông tin hiện tại của Node
      const currentNode = await manager.findOne(RefIcd10, {
        where: { icd_code: code },
      });

      if (!currentNode) {
        throw new NotFoundException(`Không tìm thấy bệnh với mã: ${code}`);
      }

      // B2: Kiểm tra trùng mã (Nếu người dùng thay đổi icd_code)
      if (updateIcd10Dto.icd_code && updateIcd10Dto.icd_code !== code) {
        const duplicate = await manager.findOne(RefIcd10, {
          where: { icd_code: updateIcd10Dto.icd_code },
        });

        if (duplicate) {
          throw new ConflictException(
            `Mã ICD '${updateIcd10Dto.icd_code}' đã tồn tại.`,
          );
        }
        // Nhờ onUpdate: 'CASCADE' ở Entity, ta không cần lo về các con của node này.
        // DB sẽ tự động update parent_code của bọn con.
      }

      // B3: Xử lý khi thay đổi Cha (Di chuyển node sang nhóm khác)
      // Logic: Nếu có parent_code mới VÀ nó khác parent_code cũ
      if (
        updateIcd10Dto.parent_code !== undefined &&
        updateIcd10Dto.parent_code !== currentNode.parent_code
      ) {
        const oldParentCode = currentNode.parent_code;
        const newParentCode = updateIcd10Dto.parent_code;

        // --- A. XỬ LÝ CHA MỚI (Nơi chuyển đến) ---
        if (newParentCode) {
          // 1. Kiểm tra cha mới tồn tại không
          const newParent = await manager.findOne(RefIcd10, {
            where: { icd_code: newParentCode },
          });

          if (!newParent) {
            throw new NotFoundException(
              `Mã cha mới '${newParentCode}' không tồn tại.`,
            );
          }

          // 2. Chống loop: Cha không thể là con của chính mình (hoặc chính mình)
          if (newParentCode === code) {
            throw new ConflictException('Không thể chọn chính mình làm cha.');
          }

          // 3. Update cha mới thành "Folder" (is_leaf = false)
          if (newParent.is_leaf) {
            await manager.update(RefIcd10, newParentCode, { is_leaf: false });
          }

          // 4. Tự động tính lại level cho node đang sửa
          updateIcd10Dto.level = (newParent.level || 0) + 1;
        } else {
          // Nếu newParentCode = null -> Chuyển thành Root (Cấp 1)
          updateIcd10Dto.level = 1;
        }

        // --- B. XỬ LÝ CHA CŨ (Nơi rời đi) ---
        if (oldParentCode) {
          // Đếm xem cha cũ còn bao nhiêu con (TRỪ đi đứa đang chuẩn bị chuyển đi)
          // Ta dùng query đếm tất cả con của cha cũ, ngoại trừ mã icd_code đang sửa
          const siblingsCount = await manager.count(RefIcd10, {
            where: {
              parent_code: oldParentCode,
              // Quan trọng: Vì transaction chưa commit, trong DB nó vẫn đang nằm ở cha cũ
              // nên ta đếm tổng số con hiện tại.
            },
          });

          // Nếu tổng số con là 1 (chính là thằng đang chuyển đi) -> Sau khi đi cha sẽ cô đơn
          if (siblingsCount <= 1) {
            await manager.update(RefIcd10, oldParentCode, { is_leaf: true });
          }
        }
      }

      // B4: Thực hiện Update
      // Do PK (icd_code) có thể bị thay đổi, ta dùng lệnh update của manager
      // update(Entity, điều_kiện_cũ, dữ_liệu_mới)
      await manager.update(RefIcd10, code, updateIcd10Dto);

      // B5: Trả về kết quả mới nhất
      // Lưu ý: Phải tìm theo mã MỚI (nếu có đổi mã), hoặc mã cũ
      const newCode = updateIcd10Dto.icd_code || code;
      const result = await manager.findOne(RefIcd10, {
        where: { icd_code: newCode },
      });

      if (!result) {
        throw new NotFoundException(
          `Lỗi hệ thống: Không tìm thấy bản ghi sau khi cập nhật.`,
        );
      }

      return result;
    });
  }

  // 6. XÓA (REMOVE) - CÓ KIỂM TRA RÀNG BUỘC & CẬP NHẬT CHA
  async remove(code: string) {
    return await this.dataSource.transaction(async (manager) => {
      // B1: Tìm node cần xóa để lấy thông tin (đặc biệt là parent_code)
      const nodeToDelete = await manager.findOne(RefIcd10, {
        where: { icd_code: code },
      });

      if (!nodeToDelete) {
        throw new NotFoundException(`Không tìm thấy ICD code: ${code}`);
      }

      // B2: Kiểm tra xem node này có con không?
      // Nếu còn con thì KHÔNG ĐƯỢC XÓA (User phải xóa con trước - "Xóa dần từ leaf lên")
      const childrenCount = await manager.count(RefIcd10, {
        where: { parent_code: code },
      });

      if (childrenCount > 0) {
        throw new ConflictException(
          `Không thể xóa '${code}' vì vẫn còn ${childrenCount} bệnh cấp dưới. Hãy xóa các bệnh con trước.`,
        );
      }

      // B3: Lưu lại parent_code trước khi xóa để tí nữa check
      const parentCode = nodeToDelete.parent_code;

      // B4: Tiến hành xóa node (Lúc này chắc chắn nó là leaf hoặc node cô đơn)
      const result = await manager.delete(RefIcd10, code);

      // B5: Cập nhật lại trạng thái của Node Cha (nếu có)
      if (parentCode) {
        // Đếm xem cha còn bao nhiêu con sau khi xóa node vừa rồi
        const remainingSiblings = await manager.count(RefIcd10, {
          where: { parent_code: parentCode },
        });

        // Nếu không còn con nào -> Cha trở thành Leaf
        if (remainingSiblings === 0) {
          await manager.update(RefIcd10, parentCode, { is_leaf: true });
        }
      }

      return result;
    });
  }
}
