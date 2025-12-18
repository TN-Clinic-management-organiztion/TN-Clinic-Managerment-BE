import { PrescriptionStatus } from './../../../database/entities/pharmacy/prescriptions.entity';
import { Prescription } from 'src/database/entities/pharmacy/prescriptions.entity';
import { PrescriptionDetail } from 'src/database/entities/pharmacy/prescription_details.entity';
import { RefDrug } from 'src/database/entities/pharmacy/ref_drugs.entity';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { DispensePrescriptionDto, ManualDispenseDto } from 'src/modules/pharmacy/dispensing/dto/dispensing.dto';

@Injectable()
export class DispensingService {
  constructor(
    @InjectRepository(Prescription)
    private readonly prescriptionRepo: Repository<Prescription>,
    @InjectRepository(PrescriptionDetail)
    private readonly detailRepo: Repository<PrescriptionDetail>,
    @InjectRepository(RefDrug)
    private readonly drugRepo: Repository<RefDrug>,
    private readonly dataSource: DataSource,
  ) {}

  async dispensePrescription(
    dto: DispensePrescriptionDto,
  ): Promise<Prescription> {
    const prescription = await this.prescriptionRepo.findOne({
      where: { prescription_id: dto.prescription_id },
    });

    if (!prescription) {
      throw new NotFoundException(
        `Prescription with ID ${dto.prescription_id} not found`,
      );
    }

    if (prescription.status !== PrescriptionStatus.ISSUED) {
      throw new BadRequestException(
        'Only ISSUED prescriptions can be dispensed',
      );
    }

    // Load prescription details
    const details = await this.detailRepo.find({
      where: { prescription_id: dto.prescription_id },
      relations: ['drug'],
    });

    if (details.length === 0) {
      throw new BadRequestException('Prescription has no details');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Xử lý từng detail: kiểm tra stock và giảm quantity
      for (const detail of details) {
        if (!detail.drug_id) {
          throw new BadRequestException('Prescription detail has no drug');
        }

        const drug = await queryRunner.manager.findOne(RefDrug, {
          where: { drug_id: detail.drug_id },
        });

        if (!drug) {
          throw new NotFoundException(`Drug with ID ${detail.drug_id} not found`);
        }

        if (!drug.quantity || drug.quantity < detail.quantity) {
          throw new BadRequestException(
            `Insufficient stock for drug ${drug.drug_name}. Need: ${detail.quantity}, Available: ${drug.quantity || 0}`,
          );
        }

        // Giảm quantity trong ref_drugs
        drug.quantity -= detail.quantity;
        await queryRunner.manager.save(drug);
      }

      // Cập nhật prescription status
      prescription.status = PrescriptionStatus.DISPENSED;
      prescription.dispensing_pharmacist_id = dto.dispensing_pharmacist_id;
      await queryRunner.manager.save(prescription);

      await queryRunner.commitTransaction();

      const results = await this.prescriptionRepo.findOne({
        where: { prescription_id: dto.prescription_id },
        relations: ['encounter', 'prescribing_doctor', 'dispensing_pharmacist'],
      });

      if (!results) {
        throw new BadRequestException('Prescription failed!');
      }

      return results;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getDispenseHistory(prescriptionId: string) {
    const prescription = await this.prescriptionRepo.findOne({
      where: { prescription_id: prescriptionId },
      relations: ['encounter', 'prescribing_doctor', 'dispensing_pharmacist'],
    });

    if (!prescription) {
      throw new NotFoundException(
        `Prescription with ID ${prescriptionId} not found`,
      );
    }

    const details = await this.detailRepo.find({
      where: { prescription_id: prescriptionId },
      relations: ['drug'],
    });

    return {
      prescription,
      details,
    };
  }
}
