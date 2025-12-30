import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { NotificationFiltersDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { UserPayload } from '../../common/interfaces/user-payload.interface';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all notifications with filters' })
  @ApiResponse({
    status: 200,
    description: 'Notifications retrieved successfully',
  })
  getNotifications(
    @Query() filters: NotificationFiltersDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.notificationsService.getNotifications(filters, user.userId);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get notification summary for a property' })
  @ApiResponse({
    status: 200,
    description: 'Notification summary retrieved successfully',
  })
  getSummary(
    @Query('propertyId') propertyId: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.notificationsService.getSummary(propertyId, user.userId);
  }
}
