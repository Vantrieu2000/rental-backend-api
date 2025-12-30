import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { baseSchemaOptions } from '../../../common/database/base-schema.options';

export type ReminderLogDocument = ReminderLog & Document;

@Schema(baseSchemaOptions)
export class ReminderLog {
  @Prop({ type: Types.ObjectId, ref: 'Reminder', required: true, index: true })
  reminderId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Payment', required: true })
  paymentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Room', required: true })
  roomId: Types.ObjectId;

  @Prop({ required: true })
  sentAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  recipientId: Types.ObjectId;

  @Prop()
  notificationId?: string;

  @Prop({ required: true })
  delivered: boolean;

  @Prop()
  error?: string;
}

export const ReminderLogSchema = SchemaFactory.createForClass(ReminderLog);

// Add indexes
ReminderLogSchema.index({ reminderId: 1, sentAt: -1 });
