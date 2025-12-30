import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: '507f1f77bcf86cd799439011',
  })
  @Expose()
  _id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @Expose()
  email: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
  })
  @Expose()
  name: string;

  @ApiProperty({
    description: 'User phone number',
    example: '+84901234567',
  })
  @Expose()
  phone: string;

  @ApiProperty({
    description: 'User role',
    enum: ['owner', 'manager', 'staff'],
    example: 'owner',
  })
  @Expose()
  role: string;

  @ApiProperty({
    description: 'Preferred language',
    enum: ['vi', 'en'],
    example: 'vi',
  })
  @Expose()
  language: string;

  @ApiProperty({
    description: 'Preferred currency',
    enum: ['VND', 'USD'],
    example: 'VND',
  })
  @Expose()
  currency: string;

  @ApiProperty({
    description: 'User timezone',
    example: 'Asia/Ho_Chi_Minh',
  })
  @Expose()
  timezone: string;

  @ApiProperty({
    description: 'Whether biometric authentication is enabled',
    example: false,
  })
  @Expose()
  biometricEnabled: boolean;

  @ApiProperty({
    description: 'Last login timestamp',
    example: '2024-01-15T10:30:00.000Z',
    required: false,
  })
  @Expose()
  lastLoginAt?: Date;

  @ApiProperty({
    description: 'Account creation timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
