import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentDocument } from './schemas/payment.schema';
import { RoomsService } from '../rooms/rooms.service';
import { TenantsService } from '../tenants/tenants.service';
import { PropertiesService } from '../properties/properties.service';
import {
  CreatePaymentDto,
  MarkPaidDto,
  PaymentFiltersDto,
  FeeCalculationDto,
  FeeCalculationResponseDto,
  PaymentStatisticsDto,
} from './dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    private roomsService: RoomsService,
    private tenantsService: TenantsService,
    private propertiesService: PropertiesService,
  ) {}

  /**
   * Create a new payment record
   */
  async create(
    createPaymentDto: CreatePaymentDto,
    userId: string,
  ): Promise<Payment> {
    // Verify relationships and ownership
    await this.propertiesService.findOne(createPaymentDto.propertyId, userId);
    await this.roomsService.findOne(createPaymentDto.roomId, userId);
    await this.tenantsService.findOne(createPaymentDto.tenantId, userId);

    const payment = new this.paymentModel(createPaymentDto);
    const savedPayment = await payment.save();

    // Update status based on due date
    this.updatePaymentStatus(savedPayment);
    await savedPayment.save();

    return savedPayment;
  }

  /**
   * Find all payments with filters
   */
  async findAll(
    filters: PaymentFiltersDto,
    userId: string,
  ): Promise<Payment[]> {
    const query: any = {};

    // If propertyId filter is provided, verify ownership
    if (filters.propertyId) {
      await this.propertiesService.findOne(filters.propertyId, userId);
      query.propertyId = filters.propertyId;
    } else {
      // Get all properties owned by user
      const properties = await this.propertiesService.findAll({}, userId);
      const propertyIds = properties.map((p: any) => p._id);
      query.propertyId = { $in: propertyIds };
    }

    // Add room filter
    if (filters.roomId) {
      query.roomId = filters.roomId;
    }

    // Add status filter
    if (filters.status) {
      query.status = filters.status;
    }

    // Add date range filters
    if (filters.startDate || filters.endDate) {
      query.dueDate = {};
      if (filters.startDate) {
        query.dueDate.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.dueDate.$lte = new Date(filters.endDate);
      }
    }

    // Add billing period filters
    if (filters.billingMonth) {
      query.billingMonth = filters.billingMonth;
    }
    if (filters.billingYear) {
      query.billingYear = filters.billingYear;
    }

    const payments = await this.paymentModel
      .find(query)
      .populate('roomId')
      .populate('tenantId')
      .sort({ dueDate: -1 })
      .exec();

    // Update status for all payments
    for (const payment of payments) {
      this.updatePaymentStatus(payment);
    }

    return payments;
  }

  /**
   * Find one payment by ID
   */
  async findOne(id: string, userId: string): Promise<Payment> {
    const payment = await this.paymentModel
      .findById(id)
      .populate('roomId')
      .populate('tenantId')
      .populate('propertyId')
      .exec();

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    // Verify ownership through property
    await this.propertiesService.findOne(
      payment.propertyId.toString(),
      userId,
    );

    // Update status
    this.updatePaymentStatus(payment);

    return payment;
  }

  /**
   * Mark payment as paid
   */
  async markAsPaid(
    id: string,
    markPaidDto: MarkPaidDto,
    userId: string,
  ): Promise<Payment> {
    // Verify ownership first
    const payment = await this.findOne(id, userId);

    // Determine new status
    let newStatus = 'paid';
    if (markPaidDto.paidAmount < payment.totalAmount) {
      newStatus = 'partial';
    }

    const updatedPayment = await this.paymentModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            status: newStatus,
            paidAmount: markPaidDto.paidAmount,
            paidDate: new Date(markPaidDto.paidDate),
            paymentMethod: markPaidDto.paymentMethod,
            notes: markPaidDto.notes || payment.notes,
          },
        },
        { new: true },
      )
      .exec();

    if (!updatedPayment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return updatedPayment;
  }

  /**
   * Get overdue payments
   */
  async getOverduePayments(
    propertyId: string,
    userId: string,
  ): Promise<Payment[]> {
    // Verify ownership
    await this.propertiesService.findOne(propertyId, userId);

    const now = new Date();
    const payments = await this.paymentModel
      .find({
        propertyId,
        dueDate: { $lt: now },
        status: { $in: ['unpaid', 'partial'] },
      })
      .populate('roomId')
      .populate('tenantId')
      .sort({ dueDate: 1 })
      .exec();

    // Update status for all payments
    for (const payment of payments) {
      this.updatePaymentStatus(payment);
      await payment.save();
    }

    return payments;
  }

  /**
   * Get payment history for a room
   */
  async getPaymentHistory(roomId: string, userId: string): Promise<Payment[]> {
    // Verify ownership
    await this.roomsService.findOne(roomId, userId);

    return this.paymentModel
      .find({ roomId })
      .populate('tenantId')
      .sort({ billingYear: -1, billingMonth: -1 })
      .exec();
  }

  /**
   * Calculate fees for a room
   */
  async calculateFees(
    feeCalculationDto: FeeCalculationDto,
    userId: string,
  ): Promise<FeeCalculationResponseDto> {
    // Verify ownership and get room
    const room = await this.roomsService.findOne(
      feeCalculationDto.roomId,
      userId,
    );

    const fees: FeeCalculationResponseDto = {
      rentalAmount: (room as any).rentalPrice,
      electricityAmount: (room as any).electricityFee,
      waterAmount: (room as any).waterFee,
      garbageAmount: (room as any).garbageFee,
      parkingAmount: (room as any).parkingFee,
      totalAmount: 0,
    };

    fees.totalAmount =
      fees.rentalAmount +
      fees.electricityAmount +
      fees.waterAmount +
      fees.garbageAmount +
      fees.parkingAmount;

    return fees;
  }

  /**
   * Get payment statistics
   */
  async getStatistics(
    propertyId: string,
    startDate: Date | undefined,
    endDate: Date | undefined,
    userId: string,
  ): Promise<PaymentStatisticsDto> {
    // Verify ownership
    await this.propertiesService.findOne(propertyId, userId);

    const query: any = { propertyId };

    // Add date range if provided
    if (startDate || endDate) {
      query.dueDate = {};
      if (startDate) {
        query.dueDate.$gte = startDate;
      }
      if (endDate) {
        query.dueDate.$lte = endDate;
      }
    }

    const payments = await this.paymentModel.find(query).exec();

    // Update status for all payments
    for (const payment of payments) {
      this.updatePaymentStatus(payment);
    }

    const paidPayments = payments.filter((p) => p.status === 'paid');
    const unpaidPayments = payments.filter(
      (p) => p.status === 'unpaid' || p.status === 'partial',
    );
    const overduePayments = payments.filter((p) => p.status === 'overdue');

    const totalRevenue = paidPayments.reduce(
      (sum, p) => sum + p.paidAmount,
      0,
    );
    const outstandingAmount = unpaidPayments.reduce(
      (sum, p) => sum + (p.totalAmount - p.paidAmount),
      0,
    );

    const latePaymentRate =
      payments.length > 0
        ? (overduePayments.length / payments.length) * 100
        : 0;

    return {
      totalRevenue,
      paidCount: paidPayments.length,
      unpaidCount: unpaidPayments.length,
      overdueCount: overduePayments.length,
      latePaymentRate: Math.round(latePaymentRate * 100) / 100,
      outstandingAmount,
    };
  }

  /**
   * Update payment status based on due date
   */
  private updatePaymentStatus(payment: PaymentDocument): void {
    const now = new Date();

    if (payment.status === 'paid') {
      return; // Don't change paid status
    }

    if (payment.dueDate < now && payment.status !== 'paid') {
      payment.status = 'overdue';
    }
  }
}
