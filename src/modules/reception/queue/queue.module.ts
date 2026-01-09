import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueueService } from './queue.service';
import { QueueController } from './queue.controller';
import { QueueTicket } from '../../../database/entities/reception/queue_tickets.entity';
import { QueueCounter } from '../../../database/entities/reception/queue_counters.entity';
import { QueueGateway } from 'src/modules/reception/queue/queue.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([QueueTicket, QueueCounter])],
  controllers: [QueueController],
  providers: [QueueService, QueueGateway],
  exports: [QueueService],
})
export class QueueModule {}
