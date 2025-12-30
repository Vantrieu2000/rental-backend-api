import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class EmergencyContactDto {
  @ApiProperty({
    description: 'Emergency contact name',
    example: 'Nguyễn Văn B',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Emergency contact phone',
    example: '+84901234568',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    description: 'Relationship to tenant',
    example: 'Anh trai',
  })
  @IsString()
  @IsNotEmpty()
  relationship: string;
}
