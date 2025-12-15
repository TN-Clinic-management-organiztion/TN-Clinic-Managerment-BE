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
import { EncountersService } from './encounters.service';
import {
  CreateEncounterDto,
  UpdateEncounterDto,
  QueryEncounterDto,
  StartConsultationDto,
  CompleteConsultationDto,
  EncounterStatus,
} from './dto/encounter.dto';

@Controller('clinical/encounters')
export class EncountersController {
  constructor(private readonly encountersService: EncountersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateEncounterDto) {
    return this.encountersService.create(dto);
  }

  @Get()
  findAll(@Query() query: QueryEncounterDto) {
    return this.encountersService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.encountersService.findOne(id);
  }

  @Get('patient/:patientId/history')
  getPatientHistory(@Param('patientId') patientId: string) {
    return this.encountersService.getPatientEncounterHistory(patientId);
  }

  @Post(':id/start-consultation')
  @HttpCode(HttpStatus.OK)
  startConsultation(
    @Param('id') id: string,
    @Body() dto: StartConsultationDto,
  ) {
    return this.encountersService.startConsultation(id, dto);
  }

  @Post(':id/complete-consultation')
  @HttpCode(HttpStatus.OK)
  completeConsultation(
    @Param('id') id: string,
    @Body() dto: CompleteConsultationDto,
  ) {
    return this.encountersService.completeConsultation(id, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEncounterDto) {
    return this.encountersService.update(id, dto);
  }

  @Patch(':id/status/:status')
  updateStatus(
    @Param('id') id: string,
    @Param('status') status: EncounterStatus,
  ) {
    return this.encountersService.updateStatus(id, status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.encountersService.remove(id);
  }
}
