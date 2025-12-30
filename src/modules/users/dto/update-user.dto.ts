import { ApiProperty, PartialType, OmitType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

// Omit password from update DTO - password updates should be handled separately
export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password', 'email'] as const),
) {
  @ApiProperty({
    description: 'Last login timestamp',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  lastLoginAt?: Date;
}
