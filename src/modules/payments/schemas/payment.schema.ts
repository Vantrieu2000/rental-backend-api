import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PaymentDocument = Payment & Document;

@Schema({ timestamps: true })
export class Payment {
  @Prop({ type: Types.ObjectId, ref: 'Room', required: true })
  roomId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: false })
  tenantId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Property', required: true })
  propertyId: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 12 })
  billingMonth: number;

  @Prop({ required: true, min: 2000 })
  billingYear: number;

  @Prop({ required: true })
  dueDate: Date;

  @Prop({ required: true })
  billingPeriodStart: Date;

  @Prop({ required: true })
  billingPeriodEnd: Date;

  @Prop({ required: true, min: 0 })
  rentalAmount: number;

  @Prop({ required: true, min: 0 })
  electricityAmount: number;

  @Prop({ required: true, min: 0 })
  waterAmount: number;

  @Prop({ required: true, min: 0 })
  garbageAmount: number;

  @Prop({ required: true, min: 0 })
  parkingAmount: number;

  @Prop({ default: 0 })
  adjustments: number;

  @Prop({ required: true, min: 0 })
  totalAmount: number;

  @Prop({
    required: true,
    enum: ['unpaid', 'partial', 'paid', 'overdue'],
    default: 'unpaid',
  })
  status: string;

  @Prop({ default: 0, min: 0 })
  paidAmount: number;

  @Prop()
  paidDate?: Date;

  @Prop({ enum: ['cash', 'bank_transfer', 'e_wallet'] })
  paymentMethod?: string;

  @Prop()
  notes?: string;

  @Prop({ default: 0, min: 0 })
  electricityUsage: number;

  @Prop({ default: 0, min: 0 })
  waterUsage: number;

  @Prop({ default: 0, min: 0 })
  previousElectricityReading: number;

  @Prop({ default: 0, min: 0 })
  currentElectricityReading: number;

  @Prop({ default: 0, min: 0 })
  previousWaterReading: number;

  @Prop({ default: 0, min: 0 })
  currentWaterReading: number;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

// Add indexes
PaymentSchema.index({ propertyId: 1, status: 1 });
PaymentSchema.index({ roomId: 1 });
PaymentSchema.index({ tenantId: 1 });
PaymentSchema.index({ dueDate: 1 });
PaymentSchema.index({ billingYear: 1, billingMonth: 1 });
