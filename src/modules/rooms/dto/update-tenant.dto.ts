import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsDateString, IsOptional } from 'class-validator';

export class UpdateTenantDto {
  @ApiProperty({
    description: 'Tenant name',
    example: 'Nguyễn Văn A',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Tenant phone number',
    example: '0901234567',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'Move-in date (ISO 8601 format)',
    example: '2024-01-15',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  moveInDate?: string;

  @ApiProperty({
    description: 'Payment due date (ISO 8601 format)',
    example: '2024-02-05',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  paymentDueDate?: string;
}
