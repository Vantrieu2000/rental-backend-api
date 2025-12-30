import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateTenantDto } from './create-tenant.dto';

// Omit roomId and moveInDate from update - these are set at creation
export class UpdateTenantDto extends PartialType(
  OmitType(CreateTenantDto, ['roomId', 'moveInDate'] as const),
) {}
