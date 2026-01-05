import { ApiProperty } from '@nestjs/swagger';

export class DashboardStatisticsDto {
  @ApiProperty({
    description: 'Total number of properties owned by user',
    example: 5,
  })
  totalProperties: number;

  @ApiProperty({
    description: 'Total number of rooms across all properties',
    example: 50,
  })
  totalRooms: number;

  @ApiProperty({
    description: 'Number of occupied rooms',
    example: 42,
  })
  occupiedRooms: number;

  @ApiProperty({
    description: 'Total number of active tenants',
    example: 42,
  })
  totalTenants: number;

  @ApiProperty({
    description: 'Total revenue for current month in VND',
    example: 50000000,
  })
  currentMonthRevenue: number;

  @ApiProperty({
    description: 'Total pending payment amount in VND',
    example: 15000000,
  })
  pendingPayments: number;

  @ApiProperty({
    description: 'Total overdue payment amount in VND',
    example: 5000000,
  })
  overduePayments: number;

  @ApiProperty({
    description: 'Occupancy rate as decimal (0-1)',
    example: 0.84,
    minimum: 0,
    maximum: 1,
  })
  occupancyRate: number;

  @ApiProperty({
    description: 'Timestamp of statistics generation',
    example: '2024-01-15T10:30:00.000Z',
  })
  timestamp: Date;
}
