import { ApiProperty } from '@nestjs/swagger';

export class NotificationSummaryDto {
  @ApiProperty({
    description: 'Total number of notifications',
    example: 15,
  })
  total: number;

  @ApiProperty({
    description: 'Number of overdue notifications',
    example: 5,
  })
  overdue: number;

  @ApiProperty({
    description: 'Number of due soon notifications',
    example: 7,
  })
  dueSoon: number;

  @ApiProperty({
    description: 'Number of unpaid notifications',
    example: 3,
  })
  unpaid: number;

  @ApiProperty({
    description: 'Number of high priority notifications',
    example: 5,
  })
  highPriority: number;

  @ApiProperty({
    description: 'Number of medium priority notifications',
    example: 7,
  })
  mediumPriority: number;

  @ApiProperty({
    description: 'Number of low priority notifications',
    example: 3,
  })
  lowPriority: number;
}
