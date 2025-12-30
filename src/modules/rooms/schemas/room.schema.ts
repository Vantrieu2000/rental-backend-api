import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RoomDocument = Room & Document;

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

  @Prop({ type: Types.ObjectId, ref: 'Tenant' })
  currentTenantId?: Types.ObjectId;
}

export const RoomSchema = SchemaFactory.createForClass(Room);

// Add indexes
RoomSchema.index({ propertyId: 1 });
RoomSchema.index({ status: 1 });
RoomSchema.index({ roomCode: 1 });
