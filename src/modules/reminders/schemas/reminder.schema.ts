import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { baseSchemaOptions } from '../../../common/database/base-schema.options';

export type ReminderDocument = Reminder & Document;

@Schema(baseSchemaOptions)
export class Reminder {
  @Prop({ type: Types.ObjectId, ref: 'Payment', required: true, index: true })
  paymentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Room', required: true, index: true })
  roomId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Property',
    required: true,
    index: true,
  })
  propertyId: Types.ObjectId;

  @Prop({
    required: true,
    enum: ['due_date', 'recurring', 'custom'],
    type: String,
  })
  type: string;

  @Prop({ required: true, index: true })
  scheduledDate: Date;

  @Prop()
  intervalDays?: number;

  @Prop({
    required: true,
    enum: ['scheduled', 'sent', 'cancelled'],
    type: String,
    default: 'scheduled',
    index: true,
  })
  status: string;

  @Prop()
  sentAt?: Date;
}

export const ReminderSchema = SchemaFactory.createForClass(Reminder);

// Add indexes
ReminderSchema.index({ propertyId: 1, status: 1 });
ReminderSchema.index({ scheduledDate: 1, status: 1 });
