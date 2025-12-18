import { RefDrug } from 'src/database/entities/pharmacy/ref_drugs.entity';
import { PrescriptionDetail } from 'src/database/entities/pharmacy/prescription_details.entity';
import { Prescription, PrescriptionStatus } from 'src/database/entities/pharmacy/prescriptions.entity';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import {
  CreatePrescriptionDto,
  UpdatePrescriptionDto,
  IssuePrescriptionDto,
  QueryPrescriptionDto,
} from './dto/prescription.dto';

@Injectable()
export class PrescriptionsService {
  constructor(
    @InjectRepository(Prescription)
    private readonly prescriptionRepo: Repository<Prescription>,
    @InjectRepository(PrescriptionDetail)
    private readonly detailRepo: Repository<PrescriptionDetail>,
    @InjectRepository(RefDrug)
    private readonly drugRepo: Repository<RefDrug>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreatePrescriptionDto): Promise<Prescription> {
    // Validate drug_ids
    const drugIds = [...new Set(dto.details.map((d) => d.drug_id))];
    const drugs = await this.drugRepo.find({
      where: { drug_id: In(drugIds), is_active: true },
    });

    if (drugs.length !== drugIds.length) {
      throw new BadRequestException('Some drugs not found or inactive');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Tạo prescription
      const prescription = this.prescriptionRepo.create({
        encounter_id: dto.encounter_id,
        prescribing_doctor_id: dto.prescribing_doctor_id,
        status: PrescriptionStatus.DRAFT,
      });
      const savedPrescription = await queryRunner.manager.save(prescription);

      // Tạo prescription details
      for (const detailDto of dto.details) {
        const detail = this.detailRepo.create({
          prescription_id: savedPrescription.prescription_id,
          drug_id: detailDto.drug_id,
          quantity: detailDto.quantity,
          usage_note: detailDto.usage_note,
        });
        await queryRunner.manager.save(detail);
      }

      await queryRunner.commitTransaction();

      return await this.findOne(savedPrescription.prescription_id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }


  async findAll(query: QueryPrescriptionDto) {
    const {
      page = 1,
      limit = 20,
      encounter_id,
      prescribing_doctor_id,
      status,
    } = query;
    const skip = (page - 1) * limit;

    const qb = this.prescriptionRepo
      .createQueryBuilder('prescription')
      .leftJoinAndSelect('prescription.encounter', 'encounter')
      .leftJoinAndSelect('prescription.prescribing_doctor', 'prescribing_doctor')
      .leftJoinAndSelect('prescription.dispensing_pharmacist', 'dispensing_pharmacist');

    if (encounter_id) {
      qb.where('prescription.encounter_id = :encounter_id', { encounter_id });
    }

    if (prescribing_doctor_id) {
      qb.andWhere('prescription.prescribing_doctor_id = :prescribing_doctor_id', {
        prescribing_doctor_id,
      });
    }

    if (status) {
      qb.andWhere('prescription.status = :status', { status });
    }

    qb.orderBy('prescription.created_at', 'DESC');
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

  async findOne(id: string): Promise<Prescription> {
    const prescription = await this.prescriptionRepo.findOne({
      where: { prescription_id: id },
      relations: [
        'encounter',
        'prescribing_doctor',
        'dispensing_pharmacist',
      ],
    });

    if (!prescription) {
      throw new NotFoundException(`Prescription with ID ${id} not found`);
    }

    // Load details
    const details = await this.detailRepo.find({
      where: { prescription_id: id },
      relations: ['drug', 'drug.category'],
    });

    (prescription as any).details = details;

    return prescription;
  }

  async issue(id: string, dto: IssuePrescriptionDto): Promise<Prescription> {
    const prescription = await this.prescriptionRepo.findOne({
      where: { prescription_id: id },
    });

    if (!prescription) {
      throw new NotFoundException(`Prescription with ID ${id} not found`);
    }

    if (prescription.status !== PrescriptionStatus.DRAFT) {
      throw new BadRequestException(
        'Only DRAFT prescriptions can be issued',
      );
    }

    prescription.status = PrescriptionStatus.ISSUED;
    prescription.prescribing_doctor_id = dto.prescribing_doctor_id;

    await this.prescriptionRepo.save(prescription);
    return await this.findOne(id);
  }

  async update(id: string, dto: UpdatePrescriptionDto): Promise<Prescription> {
    const prescription = await this.prescriptionRepo.findOne({
      where: { prescription_id: id },
    });

    if (!prescription) {
      throw new NotFoundException(`Prescription with ID ${id} not found`);
    }

    if (prescription.status === PrescriptionStatus.DISPENSED) {
      throw new BadRequestException(
        'Cannot update dispensed prescription',
      );
    }

    Object.assign(prescription, dto);
    await this.prescriptionRepo.save(prescription);
    return await this.findOne(id);
  }

  async cancel(id: string): Promise<Prescription> {
    const prescription = await this.prescriptionRepo.findOne({
      where: { prescription_id: id },
    });

    if (!prescription) {
      throw new NotFoundException(`Prescription with ID ${id} not found`);
    }

    if (prescription.status === PrescriptionStatus.DISPENSED) {
      throw new BadRequestException(
        'Cannot cancel dispensed prescription',
      );
    }

    prescription.status = PrescriptionStatus.CANCELLED;
    await this.prescriptionRepo.save(prescription);
    return await this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const prescription = await this.prescriptionRepo.findOne({
      where: { prescription_id: id },
    });

    if (!prescription) {
      throw new NotFoundException(`Prescription with ID ${id} not found`);
    }

    if (prescription.status === PrescriptionStatus.DISPENSED) {
      throw new BadRequestException(
        'Cannot delete dispensed prescription',
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.delete(PrescriptionDetail, {
        prescription_id: id,
      });

      await queryRunner.manager.delete(Prescription, {
        prescription_id: id,
      });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
