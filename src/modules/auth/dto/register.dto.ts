import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CreateUserDto } from '../../users/dto/create-user.dto';

export class RegisterDto extends CreateUserDto {
  @ApiProperty({
    description: 'Confirm password (must match password)',
    example: 'password123',
    required: false,
  })
  @IsString()
  @IsOptional()
  confirmPassword?: string;
}
