import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DispensingService } from './dispensing.service';
import {
  DispensePrescriptionDto,
} from './dto/dispensing.dto';

@Controller('pharmacy/dispensing')
export class DispensingController {
  constructor(private readonly dispensingService: DispensingService) {}

  @Post('dispense')
  @HttpCode(HttpStatus.OK)
  dispensePrescription(@Body() dto: DispensePrescriptionDto) {
    return this.dispensingService.dispensePrescription(dto);
  }

  @Get('prescription/:prescriptionId/history')
  getDispenseHistory(@Param('prescriptionId') prescriptionId: string) {
    return this.dispensingService.getDispenseHistory(prescriptionId);
  }
}