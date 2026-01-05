import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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
import { RecordUsageDto } from './dto/record-usage.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @Inject(forwardRef(() => RoomsService))
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
    this.updateOverdueStatus(savedPayment);
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
      this.updateOverdueStatus(payment);
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
    // Handle both populated and non-populated propertyId
    const propertyId = typeof payment.propertyId === 'object' && payment.propertyId !== null
      ? (payment.propertyId as any)._id.toString()
      : (payment.propertyId as any).toString();
    
    await this.propertiesService.findOne(propertyId, userId);

    // Update status
    this.updateOverdueStatus(payment);

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
      this.updateOverdueStatus(payment);
      await payment.save();
    }

    return payments;
  }

  /**
   * Get payment history for a room (enhanced with limit and overdue status)
   */
  async getPaymentHistory(
    roomId: string,
    userId: string,
    limit: number = 12,
  ): Promise<Payment[]> {
    // Verify ownership
    await this.roomsService.findOne(roomId, userId);

    // Convert string roomId to ObjectId for query
    const roomObjectId = new Types.ObjectId(roomId);

    const payments = await this.paymentModel
      .find({ roomId: roomObjectId })
      .populate('tenantId')
      .sort({ billingYear: -1, billingMonth: -1 })
      .limit(limit)
      .exec();

    // Update overdue status dynamically for each record
    for (const payment of payments) {
      this.updateOverdueStatus(payment);
    }

    return payments;
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
      this.updateOverdueStatus(payment);
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
   * Record utility usage and calculate payment amount
   */
  async recordUsage(
    roomId: string,
    usageData: RecordUsageDto,
    userId: string,
  ): Promise<Payment> {
    // 1. Validate room exists and is occupied
    const room = await this.roomsService.findOne(roomId, userId);
    
    if ((room as any).status !== 'occupied') {
      throw new BadRequestException('Cannot record usage for vacant room');
    }

    // Check if room has tenant (either embedded currentTenant or legacy currentTenantId)
    if (!(room as any).currentTenant && !(room as any).currentTenantId) {
      throw new BadRequestException('Room does not have a tenant assigned');
    }

    // 2. Get latest payment record for this room
    const payment = await this.getLatestPaymentForRoom(roomId);

    if (!payment) {
      throw new NotFoundException('No payment record found. Please wait for the system to generate a bill.');
    }

    // 3. Validate payment can be edited (not paid)
    if (payment.status === 'paid') {
      throw new BadRequestException('Cannot edit usage for paid bills');
    }

    // 4. Calculate payment amounts
    const amounts = this.calculatePaymentAmount(
      room,
      usageData.electricityUsage,
      usageData.waterUsage,
      usageData.adjustments || 0,
    );

    // Update payment
    const updatedPayment = await this.paymentModel
      .findByIdAndUpdate(
        (payment as any)._id,
        {
          $set: {
            electricityUsage: usageData.electricityUsage,
            waterUsage: usageData.waterUsage,
            previousElectricityReading: usageData.previousElectricityReading || 0,
            currentElectricityReading: usageData.currentElectricityReading || 0,
            previousWaterReading: usageData.previousWaterReading || 0,
            currentWaterReading: usageData.currentWaterReading || 0,
            rentalAmount: amounts.rentalAmount,
            electricityAmount: amounts.electricityAmount,
            waterAmount: amounts.waterAmount,
            garbageAmount: amounts.garbageAmount,
            parkingAmount: amounts.parkingAmount,
            adjustments: amounts.adjustments,
            totalAmount: amounts.totalAmount,
            notes: usageData.notes || payment.notes,
          },
        },
        { new: true },
      )
      .exec();

    if (!updatedPayment) {
      throw new NotFoundException('Payment not found');
    }

    // Update overdue status
    this.updateOverdueStatus(updatedPayment);
    await updatedPayment.save();

    return updatedPayment;
  }

  /**
   * Update usage for an existing payment (edit capability)
   */
  async updateUsage(
    paymentId: string,
    usageData: RecordUsageDto,
    userId: string,
  ): Promise<Payment> {
    // 1. Find payment and verify ownership
    const payment = await this.findOne(paymentId, userId);

    // 2. Validate payment can be edited (not paid)
    if (payment.status === 'paid') {
      throw new BadRequestException('Cannot edit usage for paid bills');
    }

    // 3. Get room to calculate amounts
    // Handle both populated and non-populated roomId
    const roomId = typeof payment.roomId === 'object' && payment.roomId !== null
      ? (payment.roomId as any)._id.toString()
      : (payment.roomId as any).toString();
    
    const room = await this.roomsService.findOne(roomId, userId);

    // 4. Calculate payment amounts
    const amounts = this.calculatePaymentAmount(
      room,
      usageData.electricityUsage,
      usageData.waterUsage,
      usageData.adjustments || 0,
    );

    // 5. Update payment
    const updatedPayment = await this.paymentModel
      .findByIdAndUpdate(
        paymentId,
        {
          $set: {
            electricityUsage: usageData.electricityUsage,
            waterUsage: usageData.waterUsage,
            previousElectricityReading: usageData.previousElectricityReading || 0,
            currentElectricityReading: usageData.currentElectricityReading || 0,
            previousWaterReading: usageData.previousWaterReading || 0,
            currentWaterReading: usageData.currentWaterReading || 0,
            rentalAmount: amounts.rentalAmount,
            electricityAmount: amounts.electricityAmount,
            waterAmount: amounts.waterAmount,
            garbageAmount: amounts.garbageAmount,
            parkingAmount: amounts.parkingAmount,
            adjustments: amounts.adjustments,
            totalAmount: amounts.totalAmount,
            notes: usageData.notes || payment.notes,
          },
        },
        { new: true },
      )
      .exec();

    if (!updatedPayment) {
      throw new NotFoundException(`Payment with ID ${paymentId} not found`);
    }

    // Update overdue status
    this.updateOverdueStatus(updatedPayment);
    await updatedPayment.save();

    return updatedPayment;
  }

  /**
   * Calculate payment amount based on usage and room configuration
   */
  calculatePaymentAmount(
    room: any,
    electricityUsage: number,
    waterUsage: number,
    adjustments: number = 0,
  ): {
    rentalAmount: number;
    electricityAmount: number;
    waterAmount: number;
    garbageAmount: number;
    parkingAmount: number;
    adjustments: number;
    totalAmount: number;
  } {
    const rentalAmount = room.rentalPrice;
    const electricityUnitPrice = room.electricityUnitPrice || 3000;
    const waterUnitPrice = room.waterUnitPrice || 20000;
    
    const electricityAmount = electricityUsage * electricityUnitPrice;
    const waterAmount = waterUsage * waterUnitPrice;
    const garbageAmount = room.garbageFee;
    const parkingAmount = room.parkingFee;

    const totalAmount =
      rentalAmount +
      electricityAmount +
      waterAmount +
      garbageAmount +
      parkingAmount +
      adjustments;

    return {
      rentalAmount,
      electricityAmount,
      waterAmount,
      garbageAmount,
      parkingAmount,
      adjustments,
      totalAmount,
    };
  }

  /**
   * Update payment status based on due date (internal helper)
   */
  private updateOverdueStatus(payment: PaymentDocument): void {
    const now = new Date();

    if (payment.status === 'paid') {
      return; // Don't change paid status
    }

    if (payment.dueDate < now && payment.status !== 'paid') {
      payment.status = 'overdue';
    }
  }

  /**
   * Get latest payment for a room
   */
  async getLatestPaymentForRoom(roomId: string): Promise<Payment | null> {
    const payment = await this.paymentModel
      .findOne({ roomId })
      .sort({ billingYear: -1, billingMonth: -1 })
      .exec();

    return payment;
  }

  /**
   * Update payment status directly (public method)
   */
  async updatePaymentStatus(
    paymentId: string,
    updateData: {
      status: string;
      paidAmount: number;
      paidDate: Date | null;
      paymentMethod?: string;
      notes?: string;
    },
  ): Promise<Payment> {
    const updateFields: any = {
      status: updateData.status,
      paidAmount: updateData.paidAmount,
    };

    if (updateData.paidDate) {
      updateFields.paidDate = updateData.paidDate;
    } else {
      updateFields.$unset = { paidDate: 1 };
    }

    if (updateData.paymentMethod) {
      updateFields.paymentMethod = updateData.paymentMethod;
    }

    if (updateData.notes) {
      updateFields.notes = updateData.notes;
    }

    const payment = await this.paymentModel
      .findByIdAndUpdate(paymentId, updateFields, { new: true })
      .exec();

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${paymentId} not found`);
    }

    return payment;
  }

  /**
   * Update payment due date
   */
  async updatePaymentDueDate(
    paymentId: string,
    newDueDate: Date,
  ): Promise<Payment> {
    const payment = await this.paymentModel
      .findByIdAndUpdate(
        paymentId,
        { $set: { dueDate: newDueDate } },
        { new: true }
      )
      .exec();

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${paymentId} not found`);
    }

    return payment;
  }

  /**
   * Find all payments with filters (enhanced with status filtering)
   */
  async findAllWithFilters(
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

    // Add status filter (support comma-separated values)
    if (filters.status) {
      const statuses = filters.status.split(',').map((s) => s.trim());
      if (statuses.length === 1) {
        query.status = statuses[0];
      } else {
        query.status = { $in: statuses };
      }
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

    // Update status for all payments dynamically
    for (const payment of payments) {
      this.updateOverdueStatus(payment);
    }

    return payments;
  }
}
