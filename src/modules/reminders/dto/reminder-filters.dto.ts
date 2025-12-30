import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsMongoId, IsEnum, IsDateString } from 'class-validator';

export class ReminderFiltersDto {
  @ApiProperty({
    description: 'Filter by property ID',
    required: false,
  })
  @IsOptional()
  @IsMongoId()
  propertyId?: string;

  @ApiProperty({
    description: 'Filter by room ID',
    required: false,
  })
  @IsOptional()
  @IsMongoId()
  roomId?: string;

  @ApiProperty({
    description: 'Filter by payment ID',
    required: false,
  })
  @IsOptional()
  @IsMongoId()
  paymentId?: string;

  @ApiProperty({
    description: 'Filter by reminder type',
    enum: ['due_date', 'recurring', 'custom'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['due_date', 'recurring', 'custom'])
  type?: string;

  @ApiProperty({
    description: 'Filter by status',
    enum: ['scheduled', 'sent', 'cancelled'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['scheduled', 'sent', 'cancelled'])
  status?: string;

  @ApiProperty({
    description: 'Filter by scheduled date from',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  scheduledDateFrom?: string;

  @ApiProperty({
    description: 'Filter by scheduled date to',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  scheduledDateTo?: string;
}
