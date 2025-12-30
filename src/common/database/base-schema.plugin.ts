import { Schema } from 'mongoose';

/**
 * Mongoose plugin to automatically add and manage timestamps
 * Adds createdAt and updatedAt fields to all schemas
 * 
 * Note: This plugin is optional. You can also use the built-in timestamps option
 * in schema options by setting { timestamps: true }
 */
export function timestampsPlugin(schema: Schema): void {
  // Add timestamp fields if they don't exist
  if (!schema.path('createdAt')) {
    schema.add({
      createdAt: {
        type: Date,
        default: Date.now,
        immutable: true,
      },
    });
  }

  if (!schema.path('updatedAt')) {
    schema.add({
      updatedAt: {
        type: Date,
        default: Date.now,
      },
    });
  }

  // Update updatedAt on save
  schema.pre('save', function (this: any, next: any) {
    if (!this.isNew) {
      this.updatedAt = new Date();
    }
    if (typeof next === 'function') {
      next();
    }
  });

  // Update updatedAt on findOneAndUpdate
  schema.pre('findOneAndUpdate', function (this: any, next: any) {
    this.set({ updatedAt: new Date() });
    if (typeof next === 'function') {
      next();
    }
  });

  // Update updatedAt on updateOne
  schema.pre('updateOne', function (this: any, next: any) {
    this.set({ updatedAt: new Date() });
    if (typeof next === 'function') {
      next();
    }
  });

  // Update updatedAt on updateMany
  schema.pre('updateMany', function (this: any, next: any) {
    this.set({ updatedAt: new Date() });
    if (typeof next === 'function') {
      next();
    }
  });
}
