import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PropertyDocument = Property & Document;

@Schema({ timestamps: true })
export class Property {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true, min: 0 })
  totalRooms: number;

  @Prop({ required: true, min: 0 })
  defaultElectricityRate: number;

  @Prop({ required: true, min: 0 })
  defaultWaterRate: number;

  @Prop({ required: true, min: 0 })
  defaultGarbageRate: number;

  @Prop({ required: true, min: 0 })
  defaultParkingRate: number;

  @Prop({ required: true, min: 1, max: 31 })
  billingDayOfMonth: number;

  @Prop({ required: true, min: 0 })
  reminderDaysBefore: number;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId: Types.ObjectId;
}

export const PropertySchema = SchemaFactory.createForClass(Property);

// Add indexes
PropertySchema.index({ ownerId: 1 });
PropertySchema.index({ name: 'text', address: 'text' });
