import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerService } from './scheduler.service';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PaymentsModule,
  ],
  providers: [SchedulerService],
  exports: [SchedulerService],
})
export class SchedulerModule {}
