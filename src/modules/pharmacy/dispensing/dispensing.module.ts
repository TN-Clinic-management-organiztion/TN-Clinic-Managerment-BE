import { RefDrug } from 'src/database/entities/pharmacy/ref_drugs.entity';
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
      RefDrug,
    ]),
  ],
  controllers: [DispensingController],
  providers: [DispensingService],
  exports: [DispensingService],
})
export class DispensingModule {}