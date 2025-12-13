import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientsService } from 'src/modules/iam/patients/patients.service';
import { PatientsController } from 'src/modules/iam/patients/patients.controller';
import { SysUser } from 'src/database/entities/auth/sys_users.entity';
import { PatientProfile } from 'src/database/entities/auth/patient_profiles.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SysUser, PatientProfile]),
  ],
  controllers: [PatientsController],
  providers: [PatientsService],
  exports: [PatientsService],
})
export class PatientsModule {}