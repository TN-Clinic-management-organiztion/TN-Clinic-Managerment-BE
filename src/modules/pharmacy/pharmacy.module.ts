import { PrescriptionsModule } from './prescriptions/rescriptions.module';
import { Module } from '@nestjs/common';
import { DrugCategoriesModule } from './drug-categories/drug-categories.module';
import { DrugsModule } from './drugs/drugs.module';
import { DrugImportsModule } from './drug-imports/drug-imports.module';
import { DispensingModule } from './dispensing/dispensing.module';

@Module({
  imports: [
    DrugCategoriesModule,
    DrugsModule,
    DrugImportsModule,
    PrescriptionsModule,
    DispensingModule,
  ],
  exports: [
    DrugCategoriesModule,
    DrugsModule,
    DrugImportsModule,
    PrescriptionsModule,
    DispensingModule,
  ],
})
export class PharmacyModule {}
