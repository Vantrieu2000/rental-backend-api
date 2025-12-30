import { ApiProperty } from '@nestjs/swagger';

export class NotificationDto {
  @ApiProperty({
    description: 'Payment ID',
    example: '507f1f77bcf86cd799439011',
  })
  paymentId: string;

  @ApiProperty({
    description: 'Room ID',
    example: '507f1f77bcf86cd799439012',
  })
  roomId: string;

  @ApiProperty({
    description: 'Room name',
    example: 'Room 101',
  })
  roomName: string;

  @ApiProperty({
    description: 'Tenant ID',
    example: '507f1f77bcf86cd799439013',
  })
  tenantId: string;

  @ApiProperty({
    description: 'Tenant name',
    example: 'John Doe',
  })
  tenantName: string;

  @ApiProperty({
    description: 'Notification type',
    enum: ['overdue', 'due_soon', 'unpaid'],
    example: 'overdue',
  })
  type: string;

  @ApiProperty({
    description: 'Notification message',
    example: 'Payment is 5 days overdue',
  })
  message: string;

  @ApiProperty({
    description: 'Payment due date',
    example: '2024-01-15T00:00:00.000Z',
  })
  dueDate: Date;

  @ApiProperty({
    description: 'Total payment amount',
    example: 5000000,
  })
  amount: number;

  @ApiProperty({
    description: 'Days overdue (negative if not yet due)',
    example: 5,
  })
  daysOverdue: number;

  @ApiProperty({
    description: 'Notification priority',
    enum: ['high', 'medium', 'low'],
    example: 'high',
  })
  priority: string;
}
