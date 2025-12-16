import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PrescriptionsService } from './prescriptions.service';
import {
  CreatePrescriptionDto,
  UpdatePrescriptionDto,
  IssuePrescriptionDto,
  QueryPrescriptionDto,
} from './dto/prescription.dto';

@Controller('pharmacy/prescriptions')
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreatePrescriptionDto) {
    return this.prescriptionsService.create(dto);
  }

  @Get()
  findAll(@Query() query: QueryPrescriptionDto) {
    return this.prescriptionsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.prescriptionsService.findOne(id);
  }

  @Post(':id/issue')
  issue(@Param('id') id: string, @Body() dto: IssuePrescriptionDto) {
    return this.prescriptionsService.issue(id, dto);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.prescriptionsService.cancel(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePrescriptionDto) {
    return this.prescriptionsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.prescriptionsService.remove(id);
  }
}