import { Module } from '@nestjs/common';
import { AppointmentsModule } from './appointments/appointments.module';
import { QueueModule } from './queue/queue.module';

@Module({
  imports: [AppointmentsModule, QueueModule],
  exports: [AppointmentsModule, QueueModule],
})
export class ReceptionModule {}