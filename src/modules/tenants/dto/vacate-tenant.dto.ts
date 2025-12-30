import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty } from 'class-validator';

export class VacateTenantDto {
  @ApiProperty({
    description: 'Move-out date',
    example: '2024-12-31',
  })
  @IsDateString({}, { message: 'Invalid date format' })
  @IsNotEmpty({ message: 'Move-out date is required' })
  moveOutDate: string;
}
