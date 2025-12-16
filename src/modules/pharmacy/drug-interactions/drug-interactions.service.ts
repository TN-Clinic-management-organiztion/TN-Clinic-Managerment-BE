import { RefDrug } from 'src/database/entities/pharmacy/ref_drugs.entity';
import { DrugInteraction } from 'src/database/entities/pharmacy/drug_interactions.entity';
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Or } from 'typeorm';
import {
  CreateDrugInteractionDto,
  UpdateDrugInteractionDto,
  QueryDrugInteractionDto,
} from './dto/drug-interaction.dto';

@Injectable()
export class DrugInteractionsService {
  constructor(
    @InjectRepository(DrugInteraction)
    private readonly interactionRepo: Repository<DrugInteraction>,
    @InjectRepository(RefDrug)
    private readonly drugRepo: Repository<RefDrug>,
  ) {}

  async create(dto: CreateDrugInteractionDto): Promise<DrugInteraction> {
    // Validate drug_a_id và drug_b_id
    if (dto.drug_a_id === dto.drug_b_id) {
      throw new BadRequestException('Drug cannot interact with itself');
    }

    const drugs = await this.drugRepo.find({
      where: { drug_id: In([dto.drug_a_id, dto.drug_b_id]) },
    });

    if (drugs.length !== 2) {
      throw new NotFoundException('One or both drugs not found');
    }

    // Kiểm tra interaction đã tồn tại (cả 2 chiều)
    const existing = await this.interactionRepo.findOne({
      where: [
        { drug_a_id: dto.drug_a_id, drug_b_id: dto.drug_b_id },
        { drug_a_id: dto.drug_b_id, drug_b_id: dto.drug_a_id },
      ],
    });

    if (existing) {
      throw new ConflictException(
        'Interaction between these drugs already exists',
      );
    }

    const interaction = this.interactionRepo.create(dto);
    return await this.interactionRepo.save(interaction);
  }

  async findAll(query: QueryDrugInteractionDto) {
    const { page = 1, limit = 20, search, drug_id, severity } = query;
    const skip = (page - 1) * limit;

    const qb = this.interactionRepo
      .createQueryBuilder('interaction')
      .leftJoinAndSelect('interaction.drug_a', 'drug_a')
      .leftJoinAndSelect('interaction.drug_b', 'drug_b');

    // Tìm tất cả tương tác của 1 thuốc
    if (drug_id) {
      qb.where(
        '(interaction.drug_a_id = :drug_id OR interaction.drug_b_id = :drug_id)',
        { drug_id },
      );
    }

    // Lọc theo severity
    if (severity) {
      qb.andWhere('interaction.severity = :severity', { severity });
    }

    // Tìm kiếm theo tên thuốc
    if (search) {
      qb.andWhere(
        '(drug_a.drug_name ILIKE :search OR drug_b.drug_name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    qb.orderBy('interaction.severity', 'DESC');
    qb.addOrderBy('drug_a.drug_name', 'ASC');
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

  async findOne(id: number): Promise<DrugInteraction> {
    const interaction = await this.interactionRepo.findOne({
      where: { interaction_id: id },
      relations: ['drug_a', 'drug_b'],
    });

    if (!interaction) {
      throw new NotFoundException(
        `Drug interaction with ID ${id} not found`,
      );
    }

    return interaction;
  }

  async checkInteractions(drugIds: number[]): Promise<DrugInteraction[]> {
    if (drugIds.length < 2) return [];

    // Tìm tất cả tương tác giữa các thuốc trong list
    return await this.interactionRepo
      .createQueryBuilder('interaction')
      .leftJoinAndSelect('interaction.drug_a', 'drug_a')
      .leftJoinAndSelect('interaction.drug_b', 'drug_b')
      .where(
        '(interaction.drug_a_id IN (:...drugIds) AND interaction.drug_b_id IN (:...drugIds))',
        { drugIds },
      )
      .orderBy('interaction.severity', 'DESC')
      .getMany();
  }

  async update(
    id: number,
    dto: UpdateDrugInteractionDto,
  ): Promise<DrugInteraction> {
    const interaction = await this.findOne(id);

    // Validate nếu có thay đổi drug_id
    if (dto.drug_a_id !== undefined || dto.drug_b_id !== undefined) {
      const newDrugAId = dto.drug_a_id ?? interaction.drug_a_id;
      const newDrugBId = dto.drug_b_id ?? interaction.drug_b_id;

      if (newDrugAId === newDrugBId) {
        throw new BadRequestException('Drug cannot interact with itself');
      }

      // Kiểm tra drugs tồn tại
      const drugs = await this.drugRepo.find({
        where: { drug_id: In([newDrugAId, newDrugBId]) },
      });

      if (drugs.length !== 2) {
        throw new NotFoundException('One or both drugs not found');
      }

      // Kiểm tra duplicate (trừ chính nó)
      const existing = await this.interactionRepo
        .createQueryBuilder('interaction')
        .where('interaction.interaction_id != :id', { id })
        .andWhere(
          '((interaction.drug_a_id = :drugA AND interaction.drug_b_id = :drugB) OR (interaction.drug_a_id = :drugB AND interaction.drug_b_id = :drugA))',
          { drugA: newDrugAId, drugB: newDrugBId },
        )
        .getOne();

      if (existing) {
        throw new ConflictException(
          'Interaction between these drugs already exists',
        );
      }
    }

    Object.assign(interaction, dto);
    return await this.interactionRepo.save(interaction);
  }

  async remove(id: number): Promise<void> {
    const interaction = await this.findOne(id);
    await this.interactionRepo.remove(interaction);
  }

  async bulkCreate(
    interactions: CreateDrugInteractionDto[],
  ): Promise<DrugInteraction[]> {
    const results: DrugInteraction[] = [];

    for (const dto of interactions) {
      try {
        const interaction = await this.create(dto);
        results.push(interaction);
      } catch (error) {
        // Log error nhưng tiếp tục với các interactions khác
        console.error(
          `Failed to create interaction between ${dto.drug_a_id} and ${dto.drug_b_id}:`,
          error.message,
        );
      }
    }

    return results;
  }
}