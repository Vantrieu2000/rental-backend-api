import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as bcrypt from 'bcrypt';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true, enum: ['owner', 'manager', 'staff'], default: 'owner' })
  role: string;

  @Prop({ enum: ['vi', 'en'], default: 'vi' })
  language: string;

  @Prop({ enum: ['VND', 'USD'], default: 'VND' })
  currency: string;

  @Prop({ default: 'Asia/Ho_Chi_Minh' })
  timezone: string;

  @Prop({ default: false })
  biometricEnabled: boolean;

  @Prop()
  lastLoginAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Add email unique index
UserSchema.index({ email: 1 }, { unique: true });

// Add password hashing pre-save hook
UserSchema.pre('save', async function () {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return;
  }

  // Generate salt and hash password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password for authentication
UserSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};
