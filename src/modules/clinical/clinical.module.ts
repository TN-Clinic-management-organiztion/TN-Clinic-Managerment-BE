import { Module } from '@nestjs/common';
import { EncountersModule } from './encounters/encounters.module';
import { Icd10Module } from './icd10/icd10.module';

@Module({
  imports: [EncountersModule, Icd10Module],
  exports: [EncountersModule, Icd10Module],
})
export class ClinicalModule {}