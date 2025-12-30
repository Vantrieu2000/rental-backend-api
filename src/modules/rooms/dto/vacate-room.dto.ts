import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class VacateRoomDto {
  @ApiProperty({
    description: 'Notes about the vacation',
    required: false,
    example: 'Tenant moved out on schedule',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
