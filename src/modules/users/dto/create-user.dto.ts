import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  IsEnum,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    description: 'User password (minimum 6 characters)',
    example: 'password123',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @ApiProperty({
    description: 'User phone number',
    example: '+84901234567',
  })
  @IsString()
  @IsNotEmpty({ message: 'Phone is required' })
  phone: string;

  @ApiProperty({
    description: 'User role',
    enum: ['owner', 'manager', 'staff'],
    default: 'owner',
    required: false,
  })
  @IsEnum(['owner', 'manager', 'staff'], {
    message: 'Role must be one of: owner, manager, staff',
  })
  @IsOptional()
  role?: string;

  @ApiProperty({
    description: 'Preferred language',
    enum: ['vi', 'en'],
    default: 'vi',
    required: false,
  })
  @IsEnum(['vi', 'en'], { message: 'Language must be either vi or en' })
  @IsOptional()
  language?: string;

  @ApiProperty({
    description: 'Preferred currency',
    enum: ['VND', 'USD'],
    default: 'VND',
    required: false,
  })
  @IsEnum(['VND', 'USD'], { message: 'Currency must be either VND or USD' })
  @IsOptional()
  currency?: string;

  @ApiProperty({
    description: 'User timezone',
    example: 'Asia/Ho_Chi_Minh',
    default: 'Asia/Ho_Chi_Minh',
    required: false,
  })
  @IsString()
  @IsOptional()
  timezone?: string;

  @ApiProperty({
    description: 'Whether biometric authentication is enabled',
    default: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  biometricEnabled?: boolean;
}
