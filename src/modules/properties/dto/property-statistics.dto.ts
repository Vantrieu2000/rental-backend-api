import { ApiProperty } from '@nestjs/swagger';

export class PropertyStatisticsDto {
  @ApiProperty({
    description: 'Total number of rooms',
    example: 10,
  })
  totalRooms: number;

  @ApiProperty({
    description: 'Number of occupied rooms',
    example: 7,
  })
  occupiedRooms: number;

  @ApiProperty({
    description: 'Number of vacant rooms',
    example: 3,
  })
  vacantRooms: number;

  @ApiProperty({
    description: 'Vacancy rate (percentage)',
    example: 30,
  })
  vacancyRate: number;

  @ApiProperty({
    description: 'Total revenue (VND)',
    example: 15000000,
  })
  totalRevenue: number;

  @ApiProperty({
    description: 'Monthly revenue (VND)',
    example: 15000000,
  })
  monthlyRevenue: number;
}
