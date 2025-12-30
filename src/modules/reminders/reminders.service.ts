import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Reminder, ReminderDocument } from './schemas/reminder.schema';
import { ReminderLog, ReminderLogDocument } from './schemas/reminder-log.schema';
import { Payment, PaymentDocument } from '../payments/schemas/payment.schema';
import {
  CreateReminderDto,
  UpdateReminderDto,
  ReminderFiltersDto,
  ProcessReminderDto,
} from './dto';

@Injectable()
export class RemindersService {
  constructor(
    @InjectModel(Reminder.name)
    private reminderModel: Model<ReminderDocument>,
    @InjectModel(ReminderLog.name)
    private reminderLogModel: Model<ReminderLogDocument>,
    @InjectModel(Payment.name)
    private paymentModel: Model<PaymentDocument>,
  ) {}

  async create(
    createReminderDto: CreateReminderDto,
    userId: string,
  ): Promise<Reminder> {
    // Validate payment exists and user has access
    const payment = await this.paymentModel
      .findById(createReminderDto.paymentId)
      .populate({
        path: 'propertyId',
        select: 'ownerId',
      })
      .exec();

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    const property = payment.propertyId as any;
    if (property.ownerId.toString() !== userId) {
      throw new ForbiddenException(
        'You do not have permission to create reminders for this payment',
      );
    }

    const reminder = new this.reminderModel(createReminderDto);
    return reminder.save();
  }

  async findAll(
    filters: ReminderFiltersDto,
    userId: string,
  ): Promise<Reminder[]> {
    const query: any = {};

    if (filters.propertyId) {
      query.propertyId = new Types.ObjectId(filters.propertyId);
    }
    if (filters.roomId) {
      query.roomId = new Types.ObjectId(filters.roomId);
    }
    if (filters.paymentId) {
      query.paymentId = new Types.ObjectId(filters.paymentId);
    }
    if (filters.type) {
      query.type = filters.type;
    }
    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.scheduledDateFrom || filters.scheduledDateTo) {
      query.scheduledDate = {};
      if (filters.scheduledDateFrom) {
        query.scheduledDate.$gte = new Date(filters.scheduledDateFrom);
      }
      if (filters.scheduledDateTo) {
        query.scheduledDate.$lte = new Date(filters.scheduledDateTo);
      }
    }

    return this.reminderModel
      .find(query)
      .populate('paymentId')
      .populate('roomId')
      .populate('propertyId')
      .sort({ scheduledDate: 1 })
      .exec();
  }

  async findOne(id: string, userId: string): Promise<Reminder> {
    const reminder = await this.reminderModel
      .findById(id)
      .populate('paymentId')
      .populate('roomId')
      .populate('propertyId')
      .exec();

    if (!reminder) {
      throw new NotFoundException('Reminder not found');
    }

    return reminder;
  }

  async update(
    id: string,
    updateReminderDto: UpdateReminderDto,
    userId: string,
  ): Promise<ReminderDocument> {
    const reminder = await this.reminderModel.findById(id).exec();

    if (!reminder) {
      throw new NotFoundException('Reminder not found');
    }

    Object.assign(reminder, updateReminderDto);
    return reminder.save();
  }

  async remove(id: string, userId: string): Promise<void> {
    const reminder = await this.findOne(id, userId);
    await this.reminderModel.findByIdAndDelete(id).exec();
  }

  async processReminder(
    id: string,
    processReminderDto: ProcessReminderDto,
    userId: string,
  ): Promise<ReminderDocument> {
    const reminder = await this.reminderModel.findById(id).exec();

    if (!reminder) {
      throw new NotFoundException('Reminder not found');
    }

    if (reminder.status !== 'scheduled') {
      throw new BadRequestException(
        'Only scheduled reminders can be processed',
      );
    }

    // Update reminder status
    reminder.status = 'sent';
    reminder.sentAt = new Date();
    await reminder.save();

    // Create reminder log
    const log = new this.reminderLogModel({
      reminderId: reminder._id,
      paymentId: reminder.paymentId,
      roomId: reminder.roomId,
      sentAt: new Date(),
      recipientId: new Types.ObjectId(processReminderDto.recipientId),
      notificationId: processReminderDto.notificationId,
      delivered: processReminderDto.delivered,
      error: processReminderDto.error,
    });
    await log.save();

    // Schedule next recurring reminder if applicable
    if (reminder.type === 'recurring' && reminder.intervalDays) {
      await this.scheduleRecurring(reminder);
    }

    return reminder;
  }

  async scheduleRecurring(reminder: Reminder): Promise<Reminder> {
    if (!reminder.intervalDays) {
      throw new BadRequestException(
        'Interval days required for recurring reminders',
      );
    }

    const nextScheduledDate = new Date(reminder.scheduledDate);
    nextScheduledDate.setDate(
      nextScheduledDate.getDate() + reminder.intervalDays,
    );

    const nextReminder = new this.reminderModel({
      paymentId: reminder.paymentId,
      roomId: reminder.roomId,
      propertyId: reminder.propertyId,
      type: 'recurring',
      scheduledDate: nextScheduledDate,
      intervalDays: reminder.intervalDays,
      status: 'scheduled',
    });

    return nextReminder.save();
  }

  async cancelForPayment(paymentId: string): Promise<void> {
    await this.reminderModel
      .updateMany(
        {
          paymentId: new Types.ObjectId(paymentId),
          status: 'scheduled',
        },
        {
          $set: { status: 'cancelled' },
        },
      )
      .exec();
  }

  async getReminderLogs(id: string, userId: string): Promise<ReminderLog[]> {
    await this.findOne(id, userId); // Verify access

    return this.reminderLogModel
      .find({ reminderId: new Types.ObjectId(id) })
      .sort({ sentAt: -1 })
      .exec();
  }
}
