import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsInt, Min, Max } from 'class-validator';

export class FeeCalculationDto {
  @ApiProperty({
    description: 'Room ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId({ message: 'Invalid room ID' })
  @IsNotEmpty({ message: 'Room ID is required' })
  roomId: string;

  @ApiProperty({
    description: 'Billing month (1-12)',
    example: 1,
    minimum: 1,
    maximum: 12,
  })
  @IsInt()
  @Min(1, { message: 'Month must be between 1 and 12' })
  @Max(12, { message: 'Month must be between 1 and 12' })
  month: number;

  @ApiProperty({
    description: 'Billing year',
    example: 2024,
    minimum: 2000,
  })
  @IsInt()
  @Min(2000, { message: 'Year must be at least 2000' })
  year: number;
}

export class FeeCalculationResponseDto {
  @ApiProperty({
    description: 'Rental fee',
    example: 3000000,
  })
  rentalAmount: number;

  @ApiProperty({
    description: 'Electricity fee',
    example: 350000,
  })
  electricityAmount: number;

  @ApiProperty({
    description: 'Water fee',
    example: 100000,
  })
  waterAmount: number;

  @ApiProperty({
    description: 'Garbage fee',
    example: 50000,
  })
  garbageAmount: number;

  @ApiProperty({
    description: 'Parking fee',
    example: 100000,
  })
  parkingAmount: number;

  @ApiProperty({
    description: 'Total amount',
    example: 3600000,
  })
  totalAmount: number;
}
