import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateReminderDto } from './create-reminder.dto';
import { IsEnum, IsOptional, IsDateString } from 'class-validator';

export class UpdateReminderDto extends PartialType(CreateReminderDto) {
  @ApiProperty({
    description: 'Reminder status',
    enum: ['scheduled', 'sent', 'cancelled'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['scheduled', 'sent', 'cancelled'])
  status?: string;

  @ApiProperty({
    description: 'Date when reminder was sent',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  sentAt?: string;
}
