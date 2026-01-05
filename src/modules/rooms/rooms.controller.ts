import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RoomsService } from './rooms.service';
import {
  CreateRoomDto,
  UpdateRoomDto,
  RoomFiltersDto,
  AssignTenantDto,
  VacateRoomDto,
  RoomsResponseDto,
  UpdatePaymentStatusDto,
} from './dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { Room } from './schemas/room.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { UserPayload } from '../../common/interfaces/user-payload.interface';

@ApiTags('Rooms')
@Controller('rooms')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  @ApiOperation({ summary: 'Create new room' })
  @ApiResponse({
    status: 201,
    description: 'Room created successfully',
    type: Room,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(
    @Body() createRoomDto: CreateRoomDto,
    @CurrentUser() user: UserPayload,
  ): Promise<Room> {
    return this.roomsService.create(createRoomDto, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all rooms with pagination and payment status' })
  @ApiResponse({
    status: 200,
    description: 'Rooms retrieved successfully with payment status',
    type: RoomsResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Query() filters: RoomFiltersDto,
    @CurrentUser() user: UserPayload,
  ): Promise<RoomsResponseDto> {
    return this.roomsService.findAllWithPaymentStatus(filters, user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get room by ID' })
  @ApiResponse({
    status: 200,
    description: 'Room retrieved successfully',
    type: Room,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
  ): Promise<Room> {
    return this.roomsService.findOne(id, user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update room' })
  @ApiResponse({
    status: 200,
    description: 'Room updated successfully',
    type: Room,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  async update(
    @Param('id') id: string,
    @Body() updateRoomDto: UpdateRoomDto,
    @CurrentUser() user: UserPayload,
  ): Promise<Room> {
    return this.roomsService.update(id, updateRoomDto, user.userId);
  }

  @Post(':id/assign-tenant')
  @ApiOperation({ summary: 'Assign tenant to room' })
  @ApiResponse({
    status: 200,
    description: 'Tenant assigned successfully',
    type: Room,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  async assignTenant(
    @Param('id') id: string,
    @Body() assignTenantDto: AssignTenantDto,
    @CurrentUser() user: UserPayload,
  ): Promise<Room> {
    return this.roomsService.assignTenant(id, assignTenantDto, user.userId);
  }

  @Post(':id/vacate')
  @ApiOperation({ summary: 'Vacate room (remove tenant)' })
  @ApiResponse({
    status: 200,
    description: 'Room vacated successfully',
    type: Room,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  async vacate(
    @Param('id') id: string,
    @Body() vacateRoomDto: VacateRoomDto,
    @CurrentUser() user: UserPayload,
  ): Promise<Room> {
    return this.roomsService.vacateRoom(id, vacateRoomDto, user.userId);
  }

  @Patch(':id/tenant')
  @ApiOperation({ 
    summary: 'Update current tenant info', 
    description: 'Update tenant information directly in room. Pass empty/null values to remove tenant.' 
  })
  @ApiResponse({
    status: 200,
    description: 'Tenant info updated successfully',
    type: Room,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  async updateTenant(
    @Param('id') id: string,
    @Body() updateTenantDto: UpdateTenantDto,
    @CurrentUser() user: UserPayload,
  ): Promise<Room> {
    return this.roomsService.updateTenantInfo(id, updateTenantDto, user.userId);
  }

  @Delete(':id/tenant')
  @ApiOperation({ summary: 'Remove current tenant from room' })
  @ApiResponse({
    status: 200,
    description: 'Tenant removed successfully',
    type: Room,
  })
  @ApiResponse({ status: 400, description: 'Room does not have a tenant' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  async removeTenant(
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
  ): Promise<Room> {
    return this.roomsService.removeTenant(id, user.userId);
  }

  @Patch(':id/payment-status')
  @ApiOperation({ summary: 'Update payment status for a room' })
  @ApiResponse({
    status: 200,
    description: 'Payment status updated successfully',
    type: Room,
  })
  @ApiResponse({ status: 400, description: 'Bad request - Room not occupied or no payment record' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  async updatePaymentStatus(
    @Param('id') id: string,
    @Body() updatePaymentStatusDto: UpdatePaymentStatusDto,
    @CurrentUser() user: UserPayload,
  ): Promise<{ success: boolean; message: string; room: any }> {
    const room = await this.roomsService.updatePaymentStatus(
      id,
      updatePaymentStatusDto.status,
      {
        paymentMethod: updatePaymentStatusDto.paymentMethod,
        notes: updatePaymentStatusDto.notes,
      },
      user.userId,
    );

    // Get updated payment status
    const paymentStatus = await this.roomsService.calculatePaymentStatus(id);

    return {
      success: true,
      message: 'Payment status updated successfully',
      room: {
        id: (room as any)._id.toString(),
        paymentStatus,
      },
    };
  }
}
