import { RefDrugCategory } from './../../../database/entities/pharmacy/ref_drug_categories.entity';
import { RefDrug } from './../../../database/entities/pharmacy/ref_drugs.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DrugsService } from './drugs.service';
import { DrugsController } from './drugs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RefDrug, RefDrugCategory])],
  controllers: [DrugsController],
  providers: [DrugsService],
  exports: [DrugsService],
})
export class DrugsModule {}