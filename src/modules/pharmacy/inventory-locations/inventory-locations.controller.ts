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
import { InventoryLocationsService } from './inventory-locations.service';
import {
  CreateInventoryLocationDto,
  UpdateInventoryLocationDto,
  QueryInventoryLocationDto,
} from './dto/inventory-location.dto';

@Controller('pharmacy/inventory-locations')
export class InventoryLocationsController {
  constructor(
    private readonly locationsService: InventoryLocationsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateInventoryLocationDto) {
    return this.locationsService.create(dto);
  }

  @Get()
  findAll(@Query() query: QueryInventoryLocationDto) {
    return this.locationsService.findAll(query);
  }

  @Get('tree')
  findTree() {
    return this.locationsService.findTree();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.locationsService.findOne(id);
  }

  @Get(':id/children')
  findChildren(@Param('id', ParseIntPipe) id: number) {
    return this.locationsService.findChildren(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateInventoryLocationDto,
  ) {
    return this.locationsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.locationsService.remove(id);
  }
}