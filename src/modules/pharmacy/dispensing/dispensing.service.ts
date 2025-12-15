import { PrescriptionStatus } from './../../../database/entities/pharmacy/prescriptions.entity';
import { Prescription } from 'src/database/entities/pharmacy/prescriptions.entity';
import { PrescriptionDetail } from 'src/database/entities/pharmacy/prescription_details.entity';
import { PrescriptionBatchDispense } from 'src/database/entities/pharmacy/prescription_batch_dispenses.entity';
import { DrugBatch } from 'src/database/entities/pharmacy/drug_batches.entity';
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
    @InjectRepository(PrescriptionBatchDispense)
    private readonly dispenseRepo: Repository<PrescriptionBatchDispense>,
    @InjectRepository(DrugBatch)
    private readonly batchRepo: Repository<DrugBatch>,
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
      // Xử lý từng detail
      for (const detail of details) {
        await this.allocateBatchesForDetail(
          queryRunner,
          detail,
          detail.quantity,
        );
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

  private async allocateBatchesForDetail(
    queryRunner: any,
    detail: PrescriptionDetail,
    quantityNeeded: number,
  ): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Lấy batches có sẵn theo FEFO (First Expired First Out)
    const availableBatches = await queryRunner.manager
      .createQueryBuilder(DrugBatch, 'batch')
      .where('batch.drug_id = :drugId', { drugId: detail.drug_id })
      .andWhere('batch.quantity_current > 0')
      .andWhere('batch.expiry_date > :today', { today })
      .orderBy('batch.expiry_date', 'ASC')
      .addOrderBy('batch.batch_id', 'ASC')
      .getMany();

    if (availableBatches.length === 0) {
      throw new BadRequestException(
        `No available batches for drug ${detail.drug?.drug_name}`,
      );
    }

    // Tính tổng số lượng có sẵn
    const totalAvailable = availableBatches.reduce(
      (sum, batch) => sum + batch.quantity_current,
      0,
    );

    if (totalAvailable < quantityNeeded) {
      throw new BadRequestException(
        `Insufficient stock for drug ${detail.drug?.drug_name}. Need: ${quantityNeeded}, Available: ${totalAvailable}`,
      );
    }

    // Phân bổ từ các batches
    let remaining = quantityNeeded;

    for (const batch of availableBatches) {
      if (remaining === 0) break;

      const quantityToTake = Math.min(remaining, batch.quantity_current);

      // Tạo dispense record
      const dispense = queryRunner.manager.create(PrescriptionBatchDispense, {
        detail_id: detail.detail_id,
        batch_id: batch.batch_id,
        quantity: quantityToTake,
      });
      await queryRunner.manager.save(dispense);

      // Cập nhật batch quantity
      batch.quantity_current -= quantityToTake;
      await queryRunner.manager.save(batch);

      remaining -= quantityToTake;
    }
  }

  async manualDispense(
    dto: ManualDispenseDto,
  ): Promise<PrescriptionBatchDispense> {
    const detail = await this.detailRepo.findOne({
      where: { detail_id: dto.detail_id },
      relations: ['prescription', 'drug'],
    });

    if (!detail) {
      throw new NotFoundException(
        `Prescription detail with ID ${dto.detail_id} not found`,
      );
    }

    if (detail.prescription?.status === PrescriptionStatus.DISPENSED) {
      throw new BadRequestException('Prescription is already fully dispensed');
    }

    const batch = await this.batchRepo.findOne({
      where: { batch_id: dto.batch_id },
      relations: ['drug'],
    });

    if (!batch) {
      throw new NotFoundException(`Batch with ID ${dto.batch_id} not found`);
    }

    if (batch.drug_id !== detail.drug_id) {
      throw new BadRequestException(
        'Batch drug does not match prescription detail drug',
      );
    }

    if (batch.quantity_current < dto.quantity) {
      throw new BadRequestException(
        `Insufficient quantity in batch. Available: ${batch.quantity_current}`,
      );
    }

    // Kiểm tra hạn sử dụng
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (batch.expiry_date <= today) {
      throw new BadRequestException('Batch is expired');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Tạo dispense record
      const dispense = this.dispenseRepo.create({
        detail_id: dto.detail_id,
        batch_id: dto.batch_id,
        quantity: dto.quantity,
      });
      const savedDispense = await queryRunner.manager.save(dispense);

      // Cập nhật batch quantity
      batch.quantity_current -= dto.quantity;
      await queryRunner.manager.save(batch);

      await queryRunner.commitTransaction();

      return savedDispense;
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

    const dispenseHistory : any[] = [];

    for (const detail of details) {
      const dispenses = await this.dispenseRepo.find({
        where: { detail_id: detail.detail_id },
        relations: ['drug_batch', 'drug_batch.location'],
        order: { dispensed_at: 'DESC' },
      });

      const totalDispensed = dispenses.reduce((sum, d) => sum + d.quantity, 0);

      dispenseHistory.push({
        detail,
        dispenses,
        total_dispensed: totalDispensed,
        remaining: detail.quantity - totalDispensed,
      });
    }

    return {
      prescription,
      dispense_history: dispenseHistory,
    };
  }

  async getDetailDispenses(detailId: string) {
    const detail = await this.detailRepo.findOne({
      where: { detail_id: detailId },
      relations: ['drug', 'prescription'],
    });

    if (!detail) {
      throw new NotFoundException(
        `Prescription detail with ID ${detailId} not found`,
      );
    }

    const dispenses = await this.dispenseRepo.find({
      where: { detail_id: detailId },
      relations: ['drug_batch', 'drug_batch.location'],
      order: { dispensed_at: 'DESC' },
    });

    const totalDispensed = dispenses.reduce((sum, d) => sum + d.quantity, 0);

    return {
      detail,
      dispenses,
      total_dispensed: totalDispensed,
      remaining: detail.quantity - totalDispensed,
    };
  }
}
