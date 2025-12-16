import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffService } from 'src/modules/iam/staff/staff.service';
import { StaffController } from 'src/modules/iam/staff/staff.controller';
import { SysUser } from 'src/database/entities/auth/sys_users.entity';
import { StaffProfile } from 'src/database/entities/auth/staff_profiles.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SysUser, StaffProfile])],
  controllers: [StaffController],
  providers: [StaffService],
  exports: [StaffService],
})
export class StaffModule {}