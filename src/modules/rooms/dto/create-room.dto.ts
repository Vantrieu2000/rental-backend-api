import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsMongoId,
  IsEnum,
  IsOptional,
} from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({
    description: 'Property ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId({ message: 'Invalid property ID' })
  @IsNotEmpty({ message: 'Property ID is required' })
  propertyId: string;

  @ApiProperty({
    description: 'Room code',
    example: 'R101',
  })
  @IsString()
  @IsNotEmpty({ message: 'Room code is required' })
  roomCode: string;

  @ApiProperty({
    description: 'Room name',
    example: 'Phòng 101',
  })
  @IsString()
  @IsNotEmpty({ message: 'Room name is required' })
  roomName: string;

  @ApiProperty({
    description: 'Room status',
    enum: ['vacant', 'occupied', 'maintenance'],
    default: 'vacant',
    required: false,
  })
  @IsEnum(['vacant', 'occupied', 'maintenance'], {
    message: 'Status must be one of: vacant, occupied, maintenance',
  })
  @IsOptional()
  status?: string;

  @ApiProperty({
    description: 'Monthly rental price (VND)',
    example: 3000000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0, { message: 'Rental price must be at least 0' })
  rentalPrice: number;

  @ApiProperty({
    description: 'Electricity fee per unit (VND/kWh)',
    example: 3500,
    minimum: 0,
  })
  @IsNumber()
  @Min(0, { message: 'Electricity fee must be at least 0' })
  electricityFee: number;

  @ApiProperty({
    description: 'Water fee per unit (VND/m³)',
    example: 20000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0, { message: 'Water fee must be at least 0' })
  waterFee: number;

  @ApiProperty({
    description: 'Garbage fee (VND/month)',
    example: 50000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0, { message: 'Garbage fee must be at least 0' })
  garbageFee: number;

  @ApiProperty({
    description: 'Parking fee (VND/month)',
    example: 100000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0, { message: 'Parking fee must be at least 0' })
  parkingFee: number;
}
