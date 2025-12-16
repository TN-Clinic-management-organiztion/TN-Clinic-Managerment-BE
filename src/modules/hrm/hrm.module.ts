import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Shifts
import { ShiftsController } from './shifts/shifts.controller';
import { ShiftsService } from './shifts/shifts.service';
import { HrShift } from '../../database/entities/hr/hr_shifts.entity';

// Leaves
import { LeavesController } from './leaves/leaves.controller';
import { LeavesService } from './leaves/leaves.service';
import { HrLeaveRequest } from '../../database/entities/hr/hr_leave_requests.entity';

// Attendance
import { AttendanceController } from './attendance/attendance.controller';
import { AttendanceService } from './attendance/attendance.service';
import { HrTimeAttendance } from '../../database/entities/hr/hr_time_attendance.entity';

// Salary Config
import { SalaryConfigController } from './salary-config/salary-config.controller';
import { SalaryConfigService } from './salary-config/salary-config.service';
import { HrSalaryConfig } from '../../database/entities/hr/hr_salary_config.entity';

// Payroll
import { PayrollController } from './payroll/payroll.controller';
import { PayrollService } from './payroll/payroll.service';
import { HrPayroll } from '../../database/entities/hr/hr_payroll.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Shifts
      HrShift,
      // Leaves
      HrLeaveRequest,
      // Attendance
      HrTimeAttendance,
      // Salary Config
      HrSalaryConfig,
      // Payroll
      HrPayroll,
    ]),
  ],
  controllers: [
    ShiftsController,
    LeavesController,
    AttendanceController,
    SalaryConfigController,
    PayrollController,
  ],
  providers: [
    ShiftsService,
    LeavesService,
    AttendanceService,
    SalaryConfigService,
    PayrollService,
  ],
  exports: [
    ShiftsService,
    LeavesService,
    AttendanceService,
    SalaryConfigService,
    PayrollService,
  ],
})
export class HrmModule {}