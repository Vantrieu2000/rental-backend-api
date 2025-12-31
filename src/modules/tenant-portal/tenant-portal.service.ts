import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Room, RoomDocument } from '../rooms/schemas/room.schema';
import { Payment, PaymentDocument } from '../payments/schemas/payment.schema';
import { CheckPaymentDto } from './dto';

@Injectable()
export class TenantPortalService {
  constructor(
    @InjectModel(Room.name) private roomModel: Model<RoomDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
  ) {}

  /**
   * Check payment information by phone number
   */
  async checkPaymentByPhone(checkPaymentDto: CheckPaymentDto) {
    const { phone } = checkPaymentDto;

    // Find all rooms with matching tenant phone
    const rooms = await this.roomModel
      .find({
        'currentTenant.phone': phone,
        status: 'occupied',
      })
      .populate('propertyId')
      .exec();

    if (!rooms || rooms.length === 0) {
      throw new NotFoundException(
        'No rooms found with this phone number. Please contact your landlord.',
      );
    }

    // Get payment records for all found rooms
    const roomIds = rooms.map((room) => room._id);
    const payments = await this.paymentModel
      .find({
        roomId: { $in: roomIds },
      })
      .sort({ billingYear: -1, billingMonth: -1 })
      .limit(12) // Last 12 months
      .exec();

    // Update payment status based on due date
    const now = new Date();
    payments.forEach((payment) => {
      if (payment.status !== 'paid' && payment.dueDate < now) {
        payment.status = 'overdue';
      }
    });

    // Group payments by room
    const paymentsByRoom = payments.reduce((acc, payment) => {
      const roomId = payment.roomId.toString();
      if (!acc[roomId]) {
        acc[roomId] = [];
      }
      acc[roomId].push(payment);
      return acc;
    }, {} as Record<string, Payment[]>);

    // Build response
    const result = rooms.map((room) => {
      const roomPayments = paymentsByRoom[room._id.toString()] || [];
      const latestPayment = roomPayments[0];

      return {
        room: {
          id: room._id,
          roomCode: room.roomCode,
          roomName: room.roomName,
          propertyName: (room.propertyId as any)?.name || 'N/A',
          propertyAddress: (room.propertyId as any)?.address || 'N/A',
          rentalPrice: room.rentalPrice,
          electricityFee: room.electricityFee,
          waterFee: room.waterFee,
          garbageFee: room.garbageFee,
          parkingFee: room.parkingFee,
          tenant: room.currentTenant,
        },
        latestPayment: latestPayment
          ? {
              id: latestPayment._id,
              billingMonth: latestPayment.billingMonth,
              billingYear: latestPayment.billingYear,
              dueDate: latestPayment.dueDate,
              totalAmount: latestPayment.totalAmount,
              paidAmount: latestPayment.paidAmount,
              status: latestPayment.status,
              rentalAmount: latestPayment.rentalAmount,
              electricityAmount: latestPayment.electricityAmount,
              waterAmount: latestPayment.waterAmount,
              garbageAmount: latestPayment.garbageAmount,
              parkingAmount: latestPayment.parkingAmount,
              adjustments: latestPayment.adjustments,
            }
          : null,
        paymentHistory: roomPayments.map((p) => ({
          id: p._id,
          billingMonth: p.billingMonth,
          billingYear: p.billingYear,
          dueDate: p.dueDate,
          totalAmount: p.totalAmount,
          paidAmount: p.paidAmount,
          status: p.status,
          paidDate: p.paidDate,
        })),
      };
    });

    return result;
  }
}
