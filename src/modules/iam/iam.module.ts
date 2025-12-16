import { Module } from '@nestjs/common';
import { AuthModule } from 'src/modules/iam/auth/auth.module';
import { StaffModule } from './staff/staff.module';
import { PatientsModule } from './patients/patients.module';
// RolesModule chỉ import nếu cần quản lý dynamic roles
// import { RolesModule } from './roles/roles.module';

@Module({
  imports: [
    AuthModule,
    StaffModule,
    PatientsModule,
    // RolesModule, // Optional
  ],
  exports: [
    AuthModule,
    StaffModule,
    PatientsModule,
  ],
})
export class IamModule {}