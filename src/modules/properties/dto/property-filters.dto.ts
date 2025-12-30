import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class PropertyFiltersDto {
  @ApiProperty({
    description: 'Search by property name or address',
    required: false,
    example: 'Hòa Bình',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
