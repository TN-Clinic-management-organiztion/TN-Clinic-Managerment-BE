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
  ParseArrayPipe,
} from '@nestjs/common';
import { DrugInteractionsService } from './drug-interactions.service';
import {
  CreateDrugInteractionDto,
  UpdateDrugInteractionDto,
  QueryDrugInteractionDto,
} from './dto/drug-interaction.dto';

@Controller('pharmacy/drug-interactions')
export class DrugInteractionsController {
  constructor(
    private readonly drugInteractionsService: DrugInteractionsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateDrugInteractionDto) {
    return this.drugInteractionsService.create(dto);
  }

  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  bulkCreate(@Body() dtos: CreateDrugInteractionDto[]) {
    return this.drugInteractionsService.bulkCreate(dtos);
  }

  @Post('check')
  @HttpCode(HttpStatus.OK)
  checkInteractions(
    @Body('drug_ids', new ParseArrayPipe({ items: Number }))
    drugIds: number[],
  ) {
    return this.drugInteractionsService.checkInteractions(drugIds);
  }

  @Get()
  findAll(@Query() query: QueryDrugInteractionDto) {
    return this.drugInteractionsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.drugInteractionsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDrugInteractionDto,
  ) {
    return this.drugInteractionsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.drugInteractionsService.remove(id);
  }
}