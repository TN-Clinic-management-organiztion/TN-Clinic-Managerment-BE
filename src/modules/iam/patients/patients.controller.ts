import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PatientsService } from 'src/modules/iam/patients/patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PatientSearchDto } from './dto/patient-search.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/role.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('patients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  @Roles('ADMIN', 'RECEPTIONIST')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createPatientDto: CreatePatientDto,
    @CurrentUser('user_id') staffId: string,
  ) {
    return this.patientsService.create(createPatientDto, staffId);
  }

  @Put(':id/cccd')
  @Roles('ADMIN', 'RECEPTIONIST')
  @HttpCode(HttpStatus.OK)
  async updateCCCD(
    @Param('id') patientId: string,
    @Body() body: { cccd: string },
  ) {
    return this.patientsService.updateCCCD(patientId, body.cccd);
  }

  @Put(':id')
  @Roles('ADMIN', 'RECEPTIONIST')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') patientId: string,
    @Body() updatePatientDto: UpdatePatientDto,
  ) {
    return this.patientsService.update(patientId, updatePatientDto);
  }

  @Get('search')
  @Roles('ADMIN', 'RECEPTIONIST', 'DOCTOR', 'PHARMACIST')
  @HttpCode(HttpStatus.OK)
  async search(@Query() searchDto: PatientSearchDto) {
    return this.patientsService.search(searchDto);
  }

  @Get('phone/:phone')
  @Roles('ADMIN', 'RECEPTIONIST', 'DOCTOR', 'PHARMACIST')
  @HttpCode(HttpStatus.OK)
  async getByPhone(@Param('phone') phone: string) {
    return this.patientsService.getByPhone(phone);
  }

  @Get(':id')
  @Roles('ADMIN', 'RECEPTIONIST', 'DOCTOR', 'PHARMACIST')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') patientId: string) {
    return this.patientsService.findOne(patientId);
  }
}