import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DashboardStatisticsDto } from './dto/dashboard-statistics.dto';
import { Property, PropertyDocument } from '../properties/schemas/property.schema';
import { Room, RoomDocument } from '../rooms/schemas/room.schema';
import { Payment, PaymentDocument } from '../payments/schemas/payment.schema';
import { Tenant, TenantDocument } from '../tenants/schemas/tenant.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Property.name) private propertyModel: Model<PropertyDocument>,
    @InjectModel(Room.name) private roomModel: Model<RoomDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
  ) {}

  async getStatistics(userId: string): Promise<DashboardStatisticsDto> {
    // Get user's property IDs
    const properties = await this.propertyModel
      .find({ ownerId: new Types.ObjectId(userId) })
      .select('_id')
      .lean();

    const propertyIds = properties.map((p) => p._id);

    // If user has no properties, return zero statistics
    if (propertyIds.length === 0) {
      return {
        totalProperties: 0,
        totalRooms: 0,
        occupiedRooms: 0,
        totalTenants: 0,
        currentMonthRevenue: 0,
        pendingPayments: 0,
        overduePayments: 0,
        occupancyRate: 0,
        timestamp: new Date(),
      };
    }

    // Get all statistics in parallel
    const [
      totalProperties,
      roomStats,
      tenantCount,
      paymentStats,
    ] = await Promise.all([
      this.getTotalProperties(userId),
      this.getRoomStatistics(propertyIds),
      this.getTenantCount(propertyIds),
      this.getPaymentStatistics(propertyIds),
    ]);

    const occupancyRate = this.calculateOccupancyRate(
      roomStats.occupiedRooms,
      roomStats.totalRooms,
    );

    return {
      totalProperties,
      totalRooms: roomStats.totalRooms,
      occupiedRooms: roomStats.occupiedRooms,
      totalTenants: tenantCount,
      currentMonthRevenue: paymentStats.currentMonthRevenue,
      pendingPayments: paymentStats.pendingPayments,
      overduePayments: paymentStats.overduePayments,
      occupancyRate,
      timestamp: new Date(),
    };
  }

  private async getTotalProperties(userId: string): Promise<number> {
    return this.propertyModel.countDocuments({
      ownerId: new Types.ObjectId(userId),
    });
  }

  private async getRoomStatistics(
    propertyIds: Types.ObjectId[],
  ): Promise<{ totalRooms: number; occupiedRooms: number }> {
    const totalRooms = await this.roomModel.countDocuments({
      propertyId: { $in: propertyIds },
    });

    const occupiedRooms = await this.roomModel.countDocuments({
      propertyId: { $in: propertyIds },
      status: 'occupied',
    });

    return { totalRooms, occupiedRooms };
  }

  private async getTenantCount(propertyIds: Types.ObjectId[]): Promise<number> {
    // Count tenants that are currently assigned to rooms in user's properties
    const rooms = await this.roomModel
      .find({
        propertyId: { $in: propertyIds },
        status: 'occupied',
        'currentTenant.name': { $exists: true },
      })
      .countDocuments();

    return rooms;
  }

  private async getPaymentStatistics(
    propertyIds: Types.ObjectId[],
  ): Promise<{
    currentMonthRevenue: number;
    pendingPayments: number;
    overduePayments: number;
  }> {
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
    const currentYear = now.getFullYear();

    // Calculate current month revenue (paid payments)
    const revenueResult = await this.paymentModel.aggregate([
      {
        $match: {
          propertyId: { $in: propertyIds },
          billingMonth: currentMonth,
          billingYear: currentYear,
          status: 'paid',
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' },
        },
      },
    ]);

    const currentMonthRevenue = revenueResult[0]?.total || 0;

    // Calculate pending payments (unpaid + partial)
    const pendingResult = await this.paymentModel.aggregate([
      {
        $match: {
          propertyId: { $in: propertyIds },
          status: { $in: ['unpaid', 'partial'] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: { $subtract: ['$totalAmount', '$paidAmount'] } },
        },
      },
    ]);

    const pendingPayments = pendingResult[0]?.total || 0;

    // Calculate overdue payments
    const overdueResult = await this.paymentModel.aggregate([
      {
        $match: {
          propertyId: { $in: propertyIds },
          status: 'overdue',
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: { $subtract: ['$totalAmount', '$paidAmount'] } },
        },
      },
    ]);

    const overduePayments = overdueResult[0]?.total || 0;

    return {
      currentMonthRevenue,
      pendingPayments,
      overduePayments,
    };
  }

  private calculateOccupancyRate(
    occupiedRooms: number,
    totalRooms: number,
  ): number {
    if (totalRooms === 0) {
      return 0;
    }
    return occupiedRooms / totalRooms;
  }
}
