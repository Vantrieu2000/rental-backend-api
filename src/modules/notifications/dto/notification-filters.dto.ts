import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsMongoId, IsEnum } from 'class-validator';

export class NotificationFiltersDto {
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
    description: 'Filter by notification type',
    enum: ['overdue', 'due_soon', 'unpaid'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['overdue', 'due_soon', 'unpaid'])
  type?: string;

  @ApiProperty({
    description: 'Filter by priority',
    enum: ['high', 'medium', 'low'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['high', 'medium', 'low'])
  priority?: string;
}
