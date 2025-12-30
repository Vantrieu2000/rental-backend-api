import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Payment, PaymentDocument } from '../payments/schemas/payment.schema';
import {
  NotificationDto,
  NotificationFiltersDto,
  NotificationSummaryDto,
} from './dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Payment.name)
    private paymentModel: Model<PaymentDocument>,
  ) {}

  async getNotifications(
    filters: NotificationFiltersDto,
    userId: string,
  ): Promise<NotificationDto[]> {
    const query: any = {
      status: { $in: ['unpaid', 'overdue'] },
    };

    if (filters.propertyId) {
      query.propertyId = new Types.ObjectId(filters.propertyId);
    }
    if (filters.roomId) {
      query.roomId = new Types.ObjectId(filters.roomId);
    }

    const payments = await this.paymentModel
      .find(query)
      .populate('roomId', 'roomName roomCode')
      .populate('tenantId', 'name phone')
      .sort({ dueDate: 1 })
      .exec();

    let notifications = payments.map((payment) =>
      this.generateNotificationFromPayment(payment),
    );

    // Apply additional filters
    if (filters.type) {
      notifications = notifications.filter((n) => n.type === filters.type);
    }
    if (filters.priority) {
      notifications = notifications.filter((n) => n.priority === filters.priority);
    }

    return notifications;
  }

  async getSummary(
    propertyId: string,
    userId: string,
  ): Promise<NotificationSummaryDto> {
    const notifications = await this.getNotifications(
      { propertyId },
      userId,
    );

    const summary: NotificationSummaryDto = {
      total: notifications.length,
      overdue: notifications.filter((n) => n.type === 'overdue').length,
      dueSoon: notifications.filter((n) => n.type === 'due_soon').length,
      unpaid: notifications.filter((n) => n.type === 'unpaid').length,
      highPriority: notifications.filter((n) => n.priority === 'high').length,
      mediumPriority: notifications.filter((n) => n.priority === 'medium')
        .length,
      lowPriority: notifications.filter((n) => n.priority === 'low').length,
    };

    return summary;
  }

  private generateNotificationFromPayment(
    payment: PaymentDocument,
  ): NotificationDto {
    const daysOverdue = this.calculateDaysOverdue(payment.dueDate);
    const room = payment.roomId as any;
    const tenant = payment.tenantId as any;

    let type: string;
    let priority: string;
    let message: string;

    if (daysOverdue > 0) {
      type = 'overdue';
      priority = daysOverdue > 7 ? 'high' : 'medium';
      message = `Payment is ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue`;
    } else if (daysOverdue >= -7) {
      type = 'due_soon';
      priority = 'medium';
      const daysUntilDue = Math.abs(daysOverdue);
      message = `Payment due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`;
    } else {
      type = 'unpaid';
      priority = 'low';
      message = 'Payment not yet due';
    }

    return {
      paymentId: payment._id.toString(),
      roomId: room._id.toString(),
      roomName: room.roomName || room.roomCode,
      tenantId: tenant._id.toString(),
      tenantName: tenant.name,
      type,
      message,
      dueDate: payment.dueDate,
      amount: payment.totalAmount,
      daysOverdue,
      priority,
    };
  }

  private calculateDaysOverdue(dueDate: Date): number {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = now.getTime() - due.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
}
