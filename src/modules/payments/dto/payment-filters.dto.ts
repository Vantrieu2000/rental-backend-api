import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsMongoId,
  IsEnum,
  IsDateString,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PaymentFiltersDto {
  @ApiProperty({
    description: 'Filter by property ID',
    required: false,
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsMongoId({ message: 'Invalid property ID' })
  propertyId?: string;

  @ApiProperty({
    description: 'Filter by room ID',
    required: false,
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsMongoId({ message: 'Invalid room ID' })
  roomId?: string;

  @ApiProperty({
    description: 'Filter by status',
    enum: ['unpaid', 'partial', 'paid', 'overdue'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['unpaid', 'partial', 'paid', 'overdue'], {
    message: 'Status must be one of: unpaid, partial, paid, overdue',
  })
  status?: string;

  @ApiProperty({
    description: 'Filter by start date',
    required: false,
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Invalid date format' })
  startDate?: string;

  @ApiProperty({
    description: 'Filter by end date',
    required: false,
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Invalid date format' })
  endDate?: string;

  @ApiProperty({
    description: 'Filter by billing month',
    required: false,
    example: 1,
    minimum: 1,
    maximum: 12,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  @Type(() => Number)
  billingMonth?: number;

  @ApiProperty({
    description: 'Filter by billing year',
    required: false,
    example: 2024,
  })
  @IsOptional()
  @IsInt()
  @Min(2000)
  @Type(() => Number)
  billingYear?: number;
}
