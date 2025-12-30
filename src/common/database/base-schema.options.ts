import { SchemaOptions } from 'mongoose';

/**
 * Base schema options to be used across all schemas
 * Provides consistent configuration for timestamps, versioning, and JSON transformation
 */
export const baseSchemaOptions: SchemaOptions = {
  // Enable automatic timestamps (createdAt, updatedAt)
  timestamps: true,

  // Enable versioning with __v field
  versionKey: '__v',

  // Transform output when converting to JSON
  toJSON: {
    virtuals: true,
    transform: (_doc, ret: any) => {
      // Convert _id to id
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },

  // Transform output when converting to Object
  toObject: {
    virtuals: true,
    transform: (_doc, ret: any) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
};

/**
 * Schema options without timestamps
 * Use this for schemas that don't need automatic timestamp management
 */
export const baseSchemaOptionsWithoutTimestamps: SchemaOptions = {
  ...baseSchemaOptions,
  timestamps: false,
};
