import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TenantDocument = Tenant & Document;

@Schema({ timestamps: true })
export class Tenant {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  phone: string;

  @Prop()
  email?: string;

  @Prop()
  idNumber?: string;

  @Prop({ type: Types.ObjectId, ref: 'Room', required: true })
  roomId: Types.ObjectId;

  @Prop({ required: true })
  moveInDate: Date;

  @Prop()
  moveOutDate?: Date;

  @Prop({
    type: {
      name: String,
      phone: String,
      relationship: String,
    },
  })
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);

// Add indexes
TenantSchema.index({ roomId: 1 });
TenantSchema.index({ name: 'text', phone: 'text' });
