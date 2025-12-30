import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsMongoId, IsEnum, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class RoomFiltersDto {
  @ApiProperty({
    description: 'Filter by property ID',
    required: false,
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsMongoId({ message: 'Invalid property ID' })
  propertyId?: string;

  @ApiProperty({
    description: 'Filter by room status',
    enum: ['vacant', 'occupied', 'maintenance'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['vacant', 'occupied', 'maintenance'], {
    message: 'Status must be one of: vacant, occupied, maintenance',
  })
  status?: string;

  @ApiProperty({
    description: 'Minimum rental price',
    required: false,
    example: 2000000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minPrice?: number;

  @ApiProperty({
    description: 'Maximum rental price',
    required: false,
    example: 5000000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  maxPrice?: number;
}
