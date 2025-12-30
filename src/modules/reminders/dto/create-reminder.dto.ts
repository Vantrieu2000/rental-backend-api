import { ApiProperty } from '@nestjs/swagger';
import {
  IsMongoId,
  IsEnum,
  IsDateString,
  IsOptional,
  IsInt,
  Min,
} from 'class-validator';

export class CreateReminderDto {
  @ApiProperty({
    description: 'Payment ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  paymentId: string;

  @ApiProperty({
    description: 'Room ID',
    example: '507f1f77bcf86cd799439012',
  })
  @IsMongoId()
  roomId: string;

  @ApiProperty({
    description: 'Property ID',
    example: '507f1f77bcf86cd799439013',
  })
  @IsMongoId()
  propertyId: string;

  @ApiProperty({
    description: 'Reminder type',
    enum: ['due_date', 'recurring', 'custom'],
    example: 'due_date',
  })
  @IsEnum(['due_date', 'recurring', 'custom'])
  type: string;

  @ApiProperty({
    description: 'Scheduled date for reminder',
    example: '2024-02-01T00:00:00.000Z',
  })
  @IsDateString()
  scheduledDate: string;

  @ApiProperty({
    description: 'Interval in days for recurring reminders',
    example: 7,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  intervalDays?: number;
}
