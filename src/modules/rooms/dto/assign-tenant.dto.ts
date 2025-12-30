import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class AssignTenantDto {
  @ApiProperty({
    description: 'Tenant ID to assign to the room',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId({ message: 'Invalid tenant ID' })
  @IsNotEmpty({ message: 'Tenant ID is required' })
  tenantId: string;
}
