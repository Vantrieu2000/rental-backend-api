import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RemindersService } from './reminders.service';
import {
  CreateReminderDto,
  UpdateReminderDto,
  ReminderFiltersDto,
  ProcessReminderDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { UserPayload } from '../../common/interfaces/user-payload.interface';

@ApiTags('Reminders')
@Controller('reminders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new reminder' })
  @ApiResponse({
    status: 201,
    description: 'Reminder created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
  })
  @ApiResponse({
    status: 404,
    description: 'Payment not found',
  })
  create(
    @Body() createReminderDto: CreateReminderDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.remindersService.create(createReminderDto, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all reminders with filters' })
  @ApiResponse({
    status: 200,
    description: 'Reminders retrieved successfully',
  })
  findAll(
    @Query() filters: ReminderFiltersDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.remindersService.findAll(filters, user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get reminder by ID' })
  @ApiResponse({
    status: 200,
    description: 'Reminder retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Reminder not found',
  })
  findOne(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    return this.remindersService.findOne(id, user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update reminder' })
  @ApiResponse({
    status: 200,
    description: 'Reminder updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Reminder not found',
  })
  update(
    @Param('id') id: string,
    @Body() updateReminderDto: UpdateReminderDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.remindersService.update(id, updateReminderDto, user.userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete reminder' })
  @ApiResponse({
    status: 204,
    description: 'Reminder deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Reminder not found',
  })
  remove(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    return this.remindersService.remove(id, user.userId);
  }

  @Post(':id/process')
  @ApiOperation({ summary: 'Process a reminder (mark as sent and create log)' })
  @ApiResponse({
    status: 200,
    description: 'Reminder processed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - reminder cannot be processed',
  })
  @ApiResponse({
    status: 404,
    description: 'Reminder not found',
  })
  processReminder(
    @Param('id') id: string,
    @Body() processReminderDto: ProcessReminderDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.remindersService.processReminder(
      id,
      processReminderDto,
      user.userId,
    );
  }

  @Get(':id/logs')
  @ApiOperation({ summary: 'Get reminder logs' })
  @ApiResponse({
    status: 200,
    description: 'Reminder logs retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Reminder not found',
  })
  getReminderLogs(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    return this.remindersService.getReminderLogs(id, user.userId);
  }
}
