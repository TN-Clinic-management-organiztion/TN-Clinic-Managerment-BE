import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DrugImportsService } from './drug-imports.service';
import { DrugImportsController } from './drug-imports.controller';
import { RefDrug } from './../../../database/entities/pharmacy/ref_drugs.entity';
import { DrugImportDetail } from './../../../database/entities/pharmacy/drug_import_details.entity';
import { DrugImport } from './../../../database/entities/pharmacy/drug_imports.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DrugImport,
      DrugImportDetail,
      RefDrug,
    ]),
  ],
  controllers: [DrugImportsController],
  providers: [DrugImportsService],
  exports: [DrugImportsService],
})
export class DrugImportsModule {}