import { DrugBatch } from 'src/database/entities/pharmacy/drug_batches.entity';
import { PrescriptionBatchDispense } from 'src/database/entities/pharmacy/prescription_batch_dispenses.entity';
import { PrescriptionDetail } from 'src/database/entities/pharmacy/prescription_details.entity';
import { Prescription } from 'src/database/entities/pharmacy/prescriptions.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DispensingService } from './dispensing.service';
import { DispensingController } from './dispensing.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Prescription,
      PrescriptionDetail,
      PrescriptionBatchDispense,
      DrugBatch,
    ]),
  ],
  controllers: [DispensingController],
  providers: [DispensingService],
  exports: [DispensingService],
})
export class DispensingModule {}