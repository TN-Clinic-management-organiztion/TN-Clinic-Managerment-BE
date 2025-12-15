import { PageQueryDto } from 'src/modules/_shared/pagination';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';
import { AppointmentStatus } from 'src/database/entities/reception/online_appointments.entity';

export class CreateAppointmentDto {
  @IsNotEmpty()
  @IsUUID()
  patient_id: string;

  @IsNotEmpty()
  @IsDateString()
  appointment_date: string;

  @IsNotEmpty()
  @IsString()
  appointment_time: string; // Format: "HH:MM"

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  desired_room_id?: number | null;

  @IsOptional()
  @IsUUID()
  desired_doctor_id?: string | null;

  @IsOptional()
  @IsString()
  symptoms?: string;
}

export class UpdateAppointmentDto extends PartialType(CreateAppointmentDto) {
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;
}

export class QueryAppointmentDto extends PageQueryDto {
  @IsOptional()
  @IsUUID()
  patient_id?: string;

  @IsOptional()
  @IsDateString()
  appointment_date?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  desired_room_id?: number;

  @IsOptional()
  @IsUUID()
  desired_doctor_id?: string;

  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;
}