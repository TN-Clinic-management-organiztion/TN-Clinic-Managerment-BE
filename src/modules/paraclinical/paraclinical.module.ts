import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResultsController } from 'src/modules/paraclinical/results/results.controller';
import { ResultsService } from 'src/modules/paraclinical/results/results.service';
import { CloudinaryModule } from 'src/shared/cloudinary/cloudinary.module';
import { ALL_ENTITIES } from 'src/shared/Tables/all_entities';

@Module({
  imports: [TypeOrmModule.forFeature(ALL_ENTITIES), CloudinaryModule],
  controllers: [ResultsController],
  providers: [ResultsService],
  exports: [ResultsService],
})
export class ParaclinicalModule {}
