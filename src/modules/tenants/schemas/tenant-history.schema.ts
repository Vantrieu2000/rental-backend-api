import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TenantHistoryDocument = TenantHistory & Document;

@Schema({ timestamps: true })
export class TenantHistory {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Room', required: true })
  roomId: Types.ObjectId;

  @Prop({ required: true })
  moveInDate: Date;

  @Prop()
  moveOutDate?: Date;
}

export const TenantHistorySchema =
  SchemaFactory.createForClass(TenantHistory);

// Add indexes
TenantHistorySchema.index({ tenantId: 1 });
TenantHistorySchema.index({ roomId: 1 });
