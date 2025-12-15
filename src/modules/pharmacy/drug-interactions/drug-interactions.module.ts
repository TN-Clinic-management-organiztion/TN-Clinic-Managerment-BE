import { RefDrug } from 'src/database/entities/pharmacy/ref_drugs.entity';
import { DrugInteraction } from 'src/database/entities/pharmacy/drug_interactions.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DrugInteractionsService } from './drug-interactions.service';
import { DrugInteractionsController } from './drug-interactions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DrugInteraction, RefDrug])],
  controllers: [DrugInteractionsController],
  providers: [DrugInteractionsService],
  exports: [DrugInteractionsService],
})
export class DrugInteractionsModule {}