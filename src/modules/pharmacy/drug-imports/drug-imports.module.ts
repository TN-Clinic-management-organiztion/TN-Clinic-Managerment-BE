import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DrugImportsService } from './drug-imports.service';
import { DrugImportsController } from './drug-imports.controller';
import { DrugSupplier } from './../../../database/entities/pharmacy/drug_suppliers.entity';
import { RefDrug } from './../../../database/entities/pharmacy/ref_drugs.entity';
import { DrugBatch } from './../../../database/entities/pharmacy/drug_batches.entity';
import { DrugImportDetail } from './../../../database/entities/pharmacy/drug_import_details.entity';
import { DrugImport } from './../../../database/entities/pharmacy/drug_imports.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DrugImport,
      DrugImportDetail,
      DrugBatch,
      RefDrug,
      DrugSupplier,
    ]),
  ],
  controllers: [DrugImportsController],
  providers: [DrugImportsService],
  exports: [DrugImportsService],
})
export class DrugImportsModule {}