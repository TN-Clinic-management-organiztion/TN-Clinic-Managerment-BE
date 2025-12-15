import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { DrugBatchesService } from './drug-batches.service';
import {
  UpdateDrugBatchDto,
  QueryDrugBatchDto,
} from './dto/drug-batch.dto';

@Controller('pharmacy/drug-batches')
export class DrugBatchesController {
  constructor(private readonly drugBatchesService: DrugBatchesService) {}

  @Get()
  findAll(@Query() query: QueryDrugBatchDto) {
    return this.drugBatchesService.findAll(query);
  }

  @Get('expired')
  getExpiredBatches() {
    return this.drugBatchesService.getExpiredBatches();
  }

  @Get('expiring')
  getExpiringBatches(@Query('days', ParseIntPipe) days: number = 30) {
    return this.drugBatchesService.getExpiringBatches(days);
  }

  @Get('drug/:drugId/available')
  findAvailableBatchesForDrug(@Param('drugId', ParseIntPipe) drugId: number) {
    return this.drugBatchesService.findAvailableBatchesForDrug(drugId);
  }

  @Get('drug/:drugId/total-stock')
  getTotalStockByDrug(@Param('drugId', ParseIntPipe) drugId: number) {
    return this.drugBatchesService.getTotalStockByDrug(drugId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.drugBatchesService.findOne(id);
  }

  @Get(':id/history')
  getBatchHistory(@Param('id', ParseIntPipe) id: number) {
    return this.drugBatchesService.getBatchHistory(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDrugBatchDto,
  ) {
    return this.drugBatchesService.update(id, dto);
  }
}