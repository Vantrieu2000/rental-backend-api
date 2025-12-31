import { ApiProperty } from '@nestjs/swagger';
import { Room } from '../schemas/room.schema';

export class RoomsResponseDto {
  @ApiProperty({
    description: 'Array of room objects',
    type: [Room],
  })
  data: Room[];

  @ApiProperty({
    description: 'Total number of rooms matching the filters',
    example: 45,
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 20,
  })
  limit: number;
}
