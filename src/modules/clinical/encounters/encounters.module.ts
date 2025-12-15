import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EncountersService } from './encounters.service';
import { EncountersController } from './encounters.controller';
import { MedicalEncounter } from '../../../database/entities/clinical/medical_encounters.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MedicalEncounter])],
  controllers: [EncountersController],
  providers: [EncountersService],
  exports: [EncountersService],
})
export class EncountersModule {}
