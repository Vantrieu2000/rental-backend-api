import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsMongoId,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EmergencyContactDto } from './emergency-contact.dto';

export class CreateTenantDto {
  @ApiProperty({
    description: 'Tenant name',
    example: 'Nguyễn Văn A',
  })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @ApiProperty({
    description: 'Tenant phone number',
    example: '+84901234567',
  })
  @IsString()
  @IsNotEmpty({ message: 'Phone is required' })
  phone: string;

  @ApiProperty({
    description: 'Tenant email',
    required: false,
    example: 'tenant@example.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;

  @ApiProperty({
    description: 'ID number (CMND/CCCD)',
    required: false,
    example: '001234567890',
  })
  @IsOptional()
  @IsString()
  idNumber?: string;

  @ApiProperty({
    description: 'Room ID',
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

  @ApiProperty({
    description: 'Emergency contact information',
    type: EmergencyContactDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => EmergencyContactDto)
  emergencyContact?: EmergencyContactDto;
}
