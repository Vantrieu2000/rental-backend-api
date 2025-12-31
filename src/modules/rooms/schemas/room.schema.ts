import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RoomDocument = Room & Document;

// Embedded current tenant info (not a reference)
export class CurrentTenant {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  moveInDate: Date;

  @Prop({ required: true })
  paymentDueDate: Date;
}

@Schema({ timestamps: true })
export class Room {
  @Prop({ type: Types.ObjectId, ref: 'Property', required: true })
  propertyId: Types.ObjectId;

  @Prop({ required: true })
  roomCode: string;

  @Prop({ required: true })
  roomName: string;

  @Prop({
    required: true,
    enum: ['vacant', 'occupied', 'maintenance'],
    default: 'vacant',
  })
  status: string;

  @Prop({ required: true, min: 0 })
  rentalPrice: number;

  @Prop({ required: true, min: 0 })
  electricityFee: number;

  @Prop({ required: true, min: 0 })
  waterFee: number;

  @Prop({ required: true, min: 0 })
  garbageFee: number;

  @Prop({ required: true, min: 0 })
  parkingFee: number;

  // Current tenant info (embedded, not reference)
  @Prop({ type: CurrentTenant, default: null })
  currentTenant?: CurrentTenant;

  // Legacy field - keep for backward compatibility
  @Prop({ type: Types.ObjectId, ref: 'Tenant' })
  currentTenantId?: Types.ObjectId;
}

export const RoomSchema = SchemaFactory.createForClass(Room);

// Add indexes
RoomSchema.index({ propertyId: 1 });
RoomSchema.index({ status: 1 });
RoomSchema.index({ roomCode: 1 });
