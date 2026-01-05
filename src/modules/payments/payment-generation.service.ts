import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Room, RoomDocument } from '../rooms/schemas/room.schema';
import { Payment, PaymentDocument } from './schemas/payment.schema';

@Injectable()
export class PaymentGenerationService {
  private readonly logger = new Logger(PaymentGenerationService.name);

  constructor(
    @InjectModel(Room.name) private roomModel: Model<RoomDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
  ) {}

  /**
   * Create payment record based on move-in anniversary
   */
  async createPaymentRecord(
    room: RoomDocument,
    currentDate: Date,
  ): Promise<{ created: boolean; payment?: Payment }> {
    if (!room.currentTenant?.moveInDate) {
      this.logger.warn(`Room ${room.roomCode} has no move-in date`);
      return { created: false };
    }

    const moveInDate = new Date(room.currentTenant.moveInDate);
    const moveInDay = moveInDate.getDate();

    // Calculate billing period based on move-in anniversary
    // Example: moveIn 3/1 → current bill period: 3/1 to 2/2
    const billingPeriodStart = new Date(currentDate);
    billingPeriodStart.setDate(moveInDay);
    
    // If current date is before move-in day, billing period is previous month
    if (currentDate.getDate() < moveInDay) {
      billingPeriodStart.setMonth(billingPeriodStart.getMonth() - 1);
    }

    // Billing period end is one day before next move-in anniversary
    const billingPeriodEnd = new Date(billingPeriodStart);
    billingPeriodEnd.setMonth(billingPeriodEnd.getMonth() + 1);
    billingPeriodEnd.setDate(billingPeriodEnd.getDate() - 1);

    // Billing month/year is the month of billing period start
    const billingMonth = billingPeriodStart.getMonth() + 1;
    const billingYear = billingPeriodStart.getFullYear();

    // Check if payment record already exists for this billing period
    const existing = await this.paymentModel
      .findOne({
        roomId: room._id,
        billingPeriodStart: billingPeriodStart,
      })
      .exec();

    if (existing) {
      this.logger.debug(
        `Payment record already exists for room ${room.roomCode} for period ${billingPeriodStart.toLocaleDateString()} - ${billingPeriodEnd.toLocaleDateString()}`,
      );
      return { created: false };
    }

    // Calculate due date based on paymentDueDay
    const paymentDueDay = room.currentTenant.paymentDueDay || 5;
    const dueDate = new Date(billingPeriodStart);
    dueDate.setDate(paymentDueDay);
    
    // If due day is before billing start, set to next month
    if (dueDate < billingPeriodStart) {
      dueDate.setMonth(dueDate.getMonth() + 1);
    }

    // Calculate initial total amount (without usage)
    const initialTotalAmount =
      room.rentalPrice + room.garbageFee + room.parkingFee;

    // Create new payment record
    const payment = new this.paymentModel({
      roomId: room._id,
      tenantId: room.currentTenantId || null,
      propertyId: room.propertyId,
      billingMonth,
      billingYear,
      billingPeriodStart,
      billingPeriodEnd,
      dueDate,
      rentalAmount: room.rentalPrice,
      electricityAmount: 0,
      waterAmount: 0,
      garbageAmount: room.garbageFee,
      parkingAmount: room.parkingFee,
      adjustments: 0,
      totalAmount: initialTotalAmount,
      status: 'unpaid',
      paidAmount: 0,
      electricityUsage: 0,
      waterUsage: 0,
      previousElectricityReading: 0,
      currentElectricityReading: 0,
      previousWaterReading: 0,
      currentWaterReading: 0,
    });

    await payment.save();

    this.logger.log(
      `Created payment record for room ${room.roomCode} for period ${billingPeriodStart.toLocaleDateString()} - ${billingPeriodEnd.toLocaleDateString()}`,
    );

    return { created: true, payment };
  }

  /**
   * Generate payment records for all rooms with move-in anniversary today
   */
  async generatePaymentRecords(currentDate: Date): Promise<{
    created: number;
    skipped: number;
    errors: number;
  }> {
    const currentDay = currentDate.getDate();
    let created = 0;
    let skipped = 0;
    let errors = 0;

    this.logger.log(
      `Starting payment generation for move-in anniversary day ${currentDay}`,
    );

    // Find all occupied rooms
    const rooms = await this.roomModel
      .find({
        status: 'occupied',
      })
      .exec();

    this.logger.log(`Found ${rooms.length} occupied rooms`);

    // Filter rooms where move-in day matches current day
    const roomsToProcess = rooms.filter((room) => {
      if (!room.currentTenant?.moveInDate) return false;
      const moveInDate = new Date(room.currentTenant.moveInDate);
      return moveInDate.getDate() === currentDay;
    });

    this.logger.log(
      `Found ${roomsToProcess.length} rooms with move-in anniversary today`,
    );

    for (const room of roomsToProcess) {
      try {
        const result = await this.createPaymentRecord(room, currentDate);
        if (result.created) {
          created++;
        } else {
          skipped++;
        }
      } catch (error) {
        errors++;
        // Log error but continue processing
        this.logger.error(
          `Failed to create payment for room ${room.roomCode}:`,
          error,
        );
      }
    }

    this.logger.log(
      `Payment generation completed: ${created} created, ${skipped} skipped, ${errors} errors`,
    );

    return { created, skipped, errors };
  }
}
