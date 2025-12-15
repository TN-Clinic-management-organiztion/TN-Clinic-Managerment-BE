import { InventoryLocation } from './../../../database/entities/pharmacy/inventory_locations.entity';
import { DrugBatch } from './../../../database/entities/pharmacy/drug_batches.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DrugBatchesService } from './drug-batches.service';
import { DrugBatchesController } from './drug-batches.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DrugBatch, InventoryLocation])],
  controllers: [DrugBatchesController],
  providers: [DrugBatchesService],
  exports: [DrugBatchesService],
})
export class DrugBatchesModule {}