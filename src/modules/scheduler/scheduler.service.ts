import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PaymentGenerationService } from '../payments/payment-generation.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private paymentGenerationService: PaymentGenerationService,
  ) {}

  /**
   * Run daily at midnight to generate payment records
   */
  @Cron('0 0 * * *', {
    name: 'daily-payment-generation',
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async dailyPaymentGeneration() {
    this.logger.log('Starting daily payment generation...');

    try {
      const currentDate = new Date();
      const result =
        await this.paymentGenerationService.generatePaymentRecords(
          currentDate,
        );

      this.logger.log(
        `Payment generation completed: ${result.created} created, ${result.skipped} skipped, ${result.errors} errors`,
      );
    } catch (error) {
      this.logger.error('Daily payment generation failed:', error);
    }
  }
}
