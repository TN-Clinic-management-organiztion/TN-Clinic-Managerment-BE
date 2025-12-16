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
import { DrugImportsService } from './drug-imports.service';
import {
  CreateDrugImportDto,
  UpdateDrugImportDto,
  QueryDrugImportDto,
} from './dto/drug-import.dto';

@Controller('pharmacy/drug-imports')
export class DrugImportsController {
  constructor(private readonly drugImportsService: DrugImportsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateDrugImportDto) {
    return this.drugImportsService.create(dto);
  }

  @Get()
  findAll(@Query() query: QueryDrugImportDto) {
    return this.drugImportsService.findAll(query);
  }

  @Get('statistics')
  getStatistics(
    @Query('from_date') from_date?: string,
    @Query('to_date') to_date?: string,
  ) {
    return this.drugImportsService.getImportStatistics(from_date, to_date);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.drugImportsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDrugImportDto,
  ) {
    return this.drugImportsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.drugImportsService.remove(id);
  }
}