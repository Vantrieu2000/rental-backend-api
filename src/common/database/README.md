# Database Utilities

This directory contains base schema utilities and configurations for MongoDB/Mongoose schemas.

## Base Schema Options

The `baseSchemaOptions` provides consistent configuration across all schemas:

```typescript
import { Schema } from '@nestjs/mongoose';
import { baseSchemaOptions } from '@/common/database';

@Schema(baseSchemaOptions)
export class User {
  // Your schema fields
}
```

### Features

- **Automatic Timestamps**: Adds `createdAt` and `updatedAt` fields
- **JSON Transformation**: Converts `_id` to `id` and removes `__v` in JSON output
- **Virtuals**: Enables virtual properties in JSON/Object output

## Timestamps Plugin

The `timestampsPlugin` is a Mongoose plugin that adds timestamp functionality:

```typescript
import { Schema } from 'mongoose';
import { timestampsPlugin } from '@/common/database';

const userSchema = new Schema({
  name: String,
  email: String,
});

userSchema.plugin(timestampsPlugin);
```

### Features

- Adds `createdAt` field (immutable, set on creation)
- Adds `updatedAt` field (updated on every save/update)
- Automatically updates `updatedAt` on:
  - `save()`
  - `findOneAndUpdate()`
  - `updateOne()`
  - `updateMany()`

## Usage Examples

### Using with @nestjs/mongoose

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { baseSchemaOptions } from '@/common/database';

@Schema(baseSchemaOptions)
export class Property extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  address: string;

  // createdAt and updatedAt are automatically added
}

export const PropertySchema = SchemaFactory.createForClass(Property);
```

### Using the Plugin Directly

```typescript
import { Schema } from 'mongoose';
import { timestampsPlugin } from '@/common/database';

const customSchema = new Schema({
  field1: String,
  field2: Number,
});

// Apply the timestamps plugin
customSchema.plugin(timestampsPlugin);
```

## Schema Options Without Timestamps

For schemas that don't need automatic timestamps:

```typescript
import { baseSchemaOptionsWithoutTimestamps } from '@/common/database';

@Schema(baseSchemaOptionsWithoutTimestamps)
export class StaticData {
  // Your fields
}
```
