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
  ManualDispenseDto,
} from './dto/dispensing.dto';

@Controller('pharmacy/dispensing')
export class DispensingController {
  constructor(private readonly dispensingService: DispensingService) {}

  @Post('dispense')
  @HttpCode(HttpStatus.OK)
  dispensePrescription(@Body() dto: DispensePrescriptionDto) {
    return this.dispensingService.dispensePrescription(dto);
  }

  @Post('manual-dispense')
  @HttpCode(HttpStatus.CREATED)
  manualDispense(@Body() dto: ManualDispenseDto) {
    return this.dispensingService.manualDispense(dto);
  }

  @Get('prescription/:prescriptionId/history')
  getDispenseHistory(@Param('prescriptionId') prescriptionId: string) {
    return this.dispensingService.getDispenseHistory(prescriptionId);
  }

  @Get('detail/:detailId/dispenses')
  getDetailDispenses(@Param('detailId') detailId: string) {
    return this.dispensingService.getDetailDispenses(detailId);
  }
}