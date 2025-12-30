import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsMongoId, IsBoolean, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class TenantFiltersDto {
  @ApiProperty({
    description: 'Filter by room ID',
    required: false,
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsMongoId({ message: 'Invalid room ID' })
  roomId?: string;

  @ApiProperty({
    description: 'Filter by active status (has not moved out)',
    required: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  active?: boolean;

  @ApiProperty({
    description: 'Search by name or phone',
    required: false,
    example: 'Nguyễn',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
