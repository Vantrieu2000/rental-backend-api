import { ApiProperty } from '@nestjs/swagger';
import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
  IsInt,
  IsDateString,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({
    description: 'Room ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId({ message: 'Invalid room ID' })
  @IsNotEmpty({ message: 'Room ID is required' })
  roomId: string;

  @ApiProperty({
    description: 'Tenant ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId({ message: 'Invalid tenant ID' })
  @IsNotEmpty({ message: 'Tenant ID is required' })
  tenantId: string;

  @ApiProperty({
    description: 'Property ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId({ message: 'Invalid property ID' })
  @IsNotEmpty({ message: 'Property ID is required' })
  propertyId: string;

  @ApiProperty({
    description: 'Billing month (1-12)',
    example: 1,
    minimum: 1,
    maximum: 12,
  })
  @IsInt()
  @Min(1, { message: 'Billing month must be between 1 and 12' })
  @Max(12, { message: 'Billing month must be between 1 and 12' })
  billingMonth: number;

  @ApiProperty({
    description: 'Billing year',
    example: 2024,
    minimum: 2000,
  })
  @IsInt()
  @Min(2000, { message: 'Billing year must be at least 2000' })
  billingYear: number;

  @ApiProperty({
    description: 'Due date',
    example: '2024-01-05',
  })
  @IsDateString({}, { message: 'Invalid date format' })
  @IsNotEmpty({ message: 'Due date is required' })
  dueDate: string;

  @ApiProperty({
    description: 'Rental amount (VND)',
    example: 3000000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0, { message: 'Rental amount must be at least 0' })
  rentalAmount: number;

  @ApiProperty({
    description: 'Electricity amount (VND)',
    example: 350000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0, { message: 'Electricity amount must be at least 0' })
  electricityAmount: number;

  @ApiProperty({
    description: 'Water amount (VND)',
    example: 100000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0, { message: 'Water amount must be at least 0' })
  waterAmount: number;

  @ApiProperty({
    description: 'Garbage amount (VND)',
    example: 50000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0, { message: 'Garbage amount must be at least 0' })
  garbageAmount: number;

  @ApiProperty({
    description: 'Parking amount (VND)',
    example: 100000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0, { message: 'Parking amount must be at least 0' })
  parkingAmount: number;

  @ApiProperty({
    description: 'Adjustments (can be negative for discounts)',
    example: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  adjustments?: number;

  @ApiProperty({
    description: 'Total amount (VND)',
    example: 3600000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0, { message: 'Total amount must be at least 0' })
  totalAmount: number;

  @ApiProperty({
    description: 'Notes',
    required: false,
    example: 'Payment for January 2024',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
