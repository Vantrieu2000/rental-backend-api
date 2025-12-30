import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
  IsInt,
} from 'class-validator';

export class CreatePropertyDto {
  @ApiProperty({
    description: 'Property name',
    example: 'Nhà trọ Hòa Bình',
  })
  @IsString()
  @IsNotEmpty({ message: 'Property name is required' })
  name: string;

  @ApiProperty({
    description: 'Property address',
    example: '123 Đường ABC, Quận 1, TP.HCM',
  })
  @IsString()
  @IsNotEmpty({ message: 'Address is required' })
  address: string;

  @ApiProperty({
    description: 'Total number of rooms',
    example: 10,
    minimum: 0,
  })
  @IsInt()
  @Min(0, { message: 'Total rooms must be at least 0' })
  totalRooms: number;

  @ApiProperty({
    description: 'Default electricity rate per unit (VND/kWh)',
    example: 3500,
    minimum: 0,
  })
  @IsNumber()
  @Min(0, { message: 'Electricity rate must be at least 0' })
  defaultElectricityRate: number;

  @ApiProperty({
    description: 'Default water rate per unit (VND/m³)',
    example: 20000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0, { message: 'Water rate must be at least 0' })
  defaultWaterRate: number;

  @ApiProperty({
    description: 'Default garbage fee (VND/month)',
    example: 50000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0, { message: 'Garbage rate must be at least 0' })
  defaultGarbageRate: number;

  @ApiProperty({
    description: 'Default parking fee (VND/month)',
    example: 100000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0, { message: 'Parking rate must be at least 0' })
  defaultParkingRate: number;

  @ApiProperty({
    description: 'Day of month for billing (1-31)',
    example: 5,
    minimum: 1,
    maximum: 31,
  })
  @IsInt()
  @Min(1, { message: 'Billing day must be between 1 and 31' })
  @Max(31, { message: 'Billing day must be between 1 and 31' })
  billingDayOfMonth: number;

  @ApiProperty({
    description: 'Number of days before due date to send reminder',
    example: 3,
    minimum: 0,
  })
  @IsInt()
  @Min(0, { message: 'Reminder days must be at least 0' })
  reminderDaysBefore: number;
}
