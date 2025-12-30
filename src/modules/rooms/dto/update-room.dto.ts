import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateRoomDto } from './create-room.dto';

// Omit propertyId from update - rooms can't be moved between properties
export class UpdateRoomDto extends PartialType(
  OmitType(CreateRoomDto, ['propertyId'] as const),
) {}
