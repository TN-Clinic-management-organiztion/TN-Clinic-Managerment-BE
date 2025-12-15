import { RefDrugCategory } from './../../../database/entities/pharmacy/ref_drug_categories.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DrugCategoriesService } from './drug-categories.service';
import { DrugCategoriesController } from './drug-categories.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RefDrugCategory])],
  controllers: [DrugCategoriesController],
  providers: [DrugCategoriesService],
  exports: [DrugCategoriesService],
})
export class DrugCategoriesModule {}