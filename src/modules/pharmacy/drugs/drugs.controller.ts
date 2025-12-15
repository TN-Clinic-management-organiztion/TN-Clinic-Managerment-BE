import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DrugsService } from './drugs.service';
import {
  CreateDrugDto,
  UpdateDrugDto,
  QueryDrugDto,
} from './dto/drug.dto';

@Controller('pharmacy/drugs')
export class DrugsController {
  constructor(private readonly drugsService: DrugsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateDrugDto) {
    return this.drugsService.create(dto);
  }

  @Get()
  findAll(@Query() query: QueryDrugDto) {
    return this.drugsService.findAll(query);
  }

  @Get('low-stock')
  getLowStockDrugs() {
    return this.drugsService.getLowStockDrugs();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.drugsService.findOne(id);
  }

  @Get(':id/stock')
  getCurrentStock(@Param('id', ParseIntPipe) id: number) {
    return this.drugsService.getCurrentStock(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDrugDto,
  ) {
    return this.drugsService.update(id, dto);
  }

  @Patch(':id/toggle-active')
  toggleActive(@Param('id', ParseIntPipe) id: number) {
    return this.drugsService.toggleActive(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.drugsService.remove(id);
  }
}