import { ApiProperty } from '@nestjs/swagger';

export class PaymentStatisticsDto {
  @ApiProperty({
    description: 'Total revenue (VND)',
    example: 50000000,
  })
  totalRevenue: number;

  @ApiProperty({
    description: 'Number of paid payments',
    example: 10,
  })
  paidCount: number;

  @ApiProperty({
    description: 'Number of unpaid payments',
    example: 3,
  })
  unpaidCount: number;

  @ApiProperty({
    description: 'Number of overdue payments',
    example: 2,
  })
  overdueCount: number;

  @ApiProperty({
    description: 'Late payment rate (percentage)',
    example: 20,
  })
  latePaymentRate: number;

  @ApiProperty({
    description: 'Total outstanding amount (VND)',
    example: 7200000,
  })
  outstandingAmount: number;
}
