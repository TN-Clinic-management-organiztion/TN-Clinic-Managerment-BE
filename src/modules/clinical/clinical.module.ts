import { Module } from '@nestjs/common';
import { Icd10Module } from 'src/modules/clinical/icd10/icd10.module';

@Module({
  imports: [Icd10Module],
  exports: [Icd10Module],
})
export class ClinicalModule {}
