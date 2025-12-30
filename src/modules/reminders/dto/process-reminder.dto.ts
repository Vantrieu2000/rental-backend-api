import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsBoolean, IsOptional, IsString } from 'class-validator';

export class ProcessReminderDto {
  @ApiProperty({
    description: 'Recipient user ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  recipientId: string;

  @ApiProperty({
    description: 'Whether the reminder was delivered successfully',
    example: true,
  })
  @IsBoolean()
  delivered: boolean;

  @ApiProperty({
    description: 'Notification ID from push notification service',
    required: false,
  })
  @IsOptional()
  @IsString()
  notificationId?: string;

  @ApiProperty({
    description: 'Error message if delivery failed',
    required: false,
  })
  @IsOptional()
  @IsString()
  error?: string;
}
