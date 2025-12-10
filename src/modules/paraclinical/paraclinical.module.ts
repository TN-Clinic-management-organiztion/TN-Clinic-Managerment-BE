import { Module } from "@nestjs/common";
import { ResultsControllor } from "src/modules/paraclinical/results/results.controller";
import { ResultsService } from "src/modules/paraclinical/results/results.service";

@Module({
  controllers: [ResultsControllor],
  providers: [ResultsService],
  exports: [ResultsService]
})

export class ParaclinicalModule {}