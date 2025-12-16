import { PrescriptionsModule } from './prescriptions/rescriptions.module';
import { Module } from '@nestjs/common';
import { DrugCategoriesModule } from './drug-categories/drug-categories.module';
import { InventoryLocationsModule } from './inventory-locations/inventory-locations.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { DrugsModule } from './drugs/drugs.module';
import { DrugImportsModule } from './drug-imports/drug-imports.module';
import { DrugBatchesModule } from './drug-batches/drug-batches.module';
import { DispensingModule } from './dispensing/dispensing.module';
import { DrugInteractionsModule } from 'src/modules/pharmacy/drug-interactions/drug-interactions.module';

@Module({
  imports: [
    DrugCategoriesModule,
    InventoryLocationsModule,
    SuppliersModule,
    DrugsModule,
    DrugImportsModule,
    DrugBatchesModule,
    PrescriptionsModule,
    DispensingModule,
    DrugInteractionsModule,
  ],
  exports: [
    DrugCategoriesModule,
    InventoryLocationsModule,
    SuppliersModule,
    DrugsModule,
    DrugImportsModule,
    DrugBatchesModule,
    PrescriptionsModule,
    DispensingModule,
    DrugInteractionsModule,
  ],
})
export class PharmacyModule {}
