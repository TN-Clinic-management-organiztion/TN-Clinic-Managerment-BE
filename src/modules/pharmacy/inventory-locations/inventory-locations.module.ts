import { InventoryLocation } from './../../../database/entities/pharmacy/inventory_locations.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryLocationsService } from './inventory-locations.service';
import { InventoryLocationsController } from './inventory-locations.controller';

@Module({
  imports: [TypeOrmModule.forFeature([InventoryLocation])],
  controllers: [InventoryLocationsController],
  providers: [InventoryLocationsService],
  exports: [InventoryLocationsService],
})
export class InventoryLocationsModule {}