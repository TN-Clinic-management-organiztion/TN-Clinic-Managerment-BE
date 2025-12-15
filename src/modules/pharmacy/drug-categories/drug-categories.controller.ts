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
import { DrugCategoriesService } from './drug-categories.service';
import { CreateDrugCategoryDto } from './dto/create-drug-category.dto';
import { UpdateDrugCategoryDto } from './dto/update-drug-category.dto';
import { QueryDrugCategoryDto } from './dto/query-drug-category.dto';

@Controller('pharmacy/drug-categories')
export class DrugCategoriesController {
  constructor(
    private readonly drugCategoriesService: DrugCategoriesService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateDrugCategoryDto) {
    return this.drugCategoriesService.create(dto);
  }

  @Get()
  findAll(@Query() query: QueryDrugCategoryDto) {
    return this.drugCategoriesService.findAll(query);
  }

  @Get('tree')
  findTree() {
    return this.drugCategoriesService.findTree();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.drugCategoriesService.findOne(id);
  }

  @Get(':id/children')
  findChildren(@Param('id', ParseIntPipe) id: number) {
    return this.drugCategoriesService.findChildren(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDrugCategoryDto,
  ) {
    return this.drugCategoriesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.drugCategoriesService.remove(id);
  }
}
