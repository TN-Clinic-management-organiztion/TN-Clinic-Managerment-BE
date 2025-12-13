import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Icd10Service } from './icd10.service';
import { Icd10Controller } from './icd10.controller';
import { RefIcd10 } from './../../../database/entities/clinical/ref_icd10.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RefIcd10])],
  controllers: [Icd10Controller],
  providers: [Icd10Service],
  exports: [Icd10Service],
})
export class Icd10Module {}