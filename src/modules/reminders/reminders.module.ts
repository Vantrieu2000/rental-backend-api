import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RemindersService } from './reminders.service';
import { RemindersController } from './reminders.controller';
import { Reminder, ReminderSchema } from './schemas/reminder.schema';
import { ReminderLog, ReminderLogSchema } from './schemas/reminder-log.schema';
import { Payment, PaymentSchema } from '../payments/schemas/payment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Reminder.name, schema: ReminderSchema },
      { name: ReminderLog.name, schema: ReminderLogSchema },
      { name: Payment.name, schema: PaymentSchema },
    ]),
  ],
  controllers: [RemindersController],
  providers: [RemindersService],
  exports: [RemindersService],
})
export class RemindersModule {}
