import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsDateString } from 'class-validator';

export class AssignTenantDto {
  @ApiProperty({
    description: 'Room ID to assign tenant to',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId({ message: 'Invalid room ID' })
  @IsNotEmpty({ message: 'Room ID is required' })
  roomId: string;

  @ApiProperty({
    description: 'Move-in date',
    example: '2024-01-01',
  })
  @IsDateString({}, { message: 'Invalid date format' })
  @IsNotEmpty({ message: 'Move-in date is required' })
  moveInDate: string;
}
