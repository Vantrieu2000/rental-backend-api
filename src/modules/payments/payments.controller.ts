import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import {
  CreatePaymentDto,
  MarkPaidDto,
  PaymentFiltersDto,
  FeeCalculationDto,
  FeeCalculationResponseDto,
  PaymentStatisticsDto,
} from './dto';
import { Payment } from './schemas/payment.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { UserPayload } from '../../common/interfaces/user-payload.interface';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create new payment record' })
  @ApiResponse({
    status: 201,
    description: 'Payment created successfully',
    type: Payment,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(
    @Body() createPaymentDto: CreatePaymentDto,
    @CurrentUser() user: UserPayload,
  ): Promise<Payment> {
    return this.paymentsService.create(createPaymentDto, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all payments' })
  @ApiResponse({
    status: 200,
    description: 'Payments retrieved successfully',
    type: [Payment],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Query() filters: PaymentFiltersDto,
    @CurrentUser() user: UserPayload,
  ): Promise<Payment[]> {
    return this.paymentsService.findAll(filters, user.userId);
  }

  @Get('overdue')
  @ApiOperation({ summary: 'Get overdue payments' })
  @ApiResponse({
    status: 200,
    description: 'Overdue payments retrieved successfully',
    type: [Payment],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getOverdue(
    @Query('propertyId') propertyId: string,
    @CurrentUser() user: UserPayload,
  ): Promise<Payment[]> {
    return this.paymentsService.getOverduePayments(propertyId, user.userId);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get payment statistics' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    type: PaymentStatisticsDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getStatistics(
    @Query('propertyId') propertyId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @CurrentUser() user?: UserPayload,
  ): Promise<PaymentStatisticsDto> {
    return this.paymentsService.getStatistics(
      propertyId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      user!.userId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiResponse({
    status: 200,
    description: 'Payment retrieved successfully',
    type: Payment,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
  ): Promise<Payment> {
    return this.paymentsService.findOne(id, user.userId);
  }

  @Put(':id/mark-paid')
  @ApiOperation({ summary: 'Mark payment as paid' })
  @ApiResponse({
    status: 200,
    description: 'Payment marked as paid successfully',
    type: Payment,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async markAsPaid(
    @Param('id') id: string,
    @Body() markPaidDto: MarkPaidDto,
    @CurrentUser() user: UserPayload,
  ): Promise<Payment> {
    return this.paymentsService.markAsPaid(id, markPaidDto, user.userId);
  }

  @Get('rooms/:roomId/payment-history')
  @ApiOperation({ summary: 'Get payment history for a room' })
  @ApiResponse({
    status: 200,
    description: 'Payment history retrieved successfully',
    type: [Payment],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getPaymentHistory(
    @Param('roomId') roomId: string,
    @CurrentUser() user: UserPayload,
  ): Promise<Payment[]> {
    return this.paymentsService.getPaymentHistory(roomId, user.userId);
  }

  @Post('calculate-fees')
  @ApiOperation({ summary: 'Calculate fees for a room' })
  @ApiResponse({
    status: 200,
    description: 'Fees calculated successfully',
    type: FeeCalculationResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async calculateFees(
    @Body() feeCalculationDto: FeeCalculationDto,
    @CurrentUser() user: UserPayload,
  ): Promise<FeeCalculationResponseDto> {
    return this.paymentsService.calculateFees(feeCalculationDto, user.userId);
  }
}
