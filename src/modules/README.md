# Feature Modules

Business logic organized by domain following NestJS module pattern.

## Module Structure

Each module follows a consistent structure:

```
module-name/
├── module-name.module.ts       # Module definition
├── module-name.controller.ts   # HTTP endpoints
├── module-name.service.ts      # Business logic
├── dto/                        # Data Transfer Objects
│   ├── create-*.dto.ts
│   ├── update-*.dto.ts
│   └── *-filters.dto.ts
└── schemas/                    # Mongoose schemas
    └── *.schema.ts
```

## Available Modules

### 1. Auth Module
**Purpose**: User authentication and authorization

**Endpoints**:
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - User logout

**Features**:
- JWT token generation
- Password hashing with bcrypt
- Token refresh mechanism
- Role-based access control

---

### 2. Users Module
**Purpose**: User account management

**Endpoints**:
- `GET /users` - List users
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

**Features**:
- User CRUD operations
- Profile management
- Password change
- Email uniqueness validation

---

### 3. Properties Module
**Purpose**: Rental property management

**Endpoints**:
- `GET /properties` - List properties with filters
- `GET /properties/:id` - Get property details
- `POST /properties` - Create property
- `PATCH /properties/:id` - Update property
- `DELETE /properties/:id` - Delete property
- `GET /properties/:id/statistics` - Get property statistics

**Features**:
- Property CRUD operations
- Ownership filtering
- Search by name/address
- Statistics calculation
- Deletion protection (if rooms exist)

---

### 4. Rooms Module
**Purpose**: Room management within properties

**Endpoints**:
- `GET /rooms` - List rooms with filters
- `GET /rooms/:id` - Get room details
- `POST /rooms` - Create room
- `PATCH /rooms/:id` - Update room
- `POST /rooms/:id/assign-tenant` - Assign tenant to room
- `POST /rooms/:id/vacate` - Vacate room

**Features**:
- Room CRUD operations
- Status management (vacant/occupied/maintenance)
- Tenant assignment
- Price management
- Property ownership validation

---

### 5. Tenants Module
**Purpose**: Tenant information and rental history

**Endpoints**:
- `GET /tenants` - List tenants with filters
- `GET /tenants/:id` - Get tenant details
- `POST /tenants` - Create tenant
- `PATCH /tenants/:id` - Update tenant
- `POST /tenants/:id/assign` - Assign to room
- `POST /tenants/:id/vacate` - Vacate room
- `GET /tenants/:id/history` - Get rental history

**Features**:
- Tenant CRUD operations
- Room assignment tracking
- Rental history
- Emergency contact management
- Search by name/phone

---

### 6. Payments Module
**Purpose**: Payment tracking and fee management

**Endpoints**:
- `GET /payments` - List payments with filters
- `GET /payments/:id` - Get payment details
- `POST /payments` - Create payment record
- `PUT /payments/:id/mark-paid` - Mark as paid
- `GET /payments/overdue` - Get overdue payments
- `GET /rooms/:roomId/payment-history` - Get payment history
- `POST /payments/calculate-fees` - Calculate fees
- `GET /payments/statistics` - Get payment statistics

**Features**:
- Payment CRUD operations
- Fee calculation (rent, utilities, etc.)
- Overdue tracking
- Payment status management
- Statistics and reporting

---

### 7. Reminders Module
**Purpose**: Automated payment reminders

**Endpoints**:
- `GET /reminders` - List reminders with filters
- `GET /reminders/:id` - Get reminder details
- `POST /reminders` - Create reminder
- `PATCH /reminders/:id` - Update reminder
- `DELETE /reminders/:id` - Delete reminder
- `POST /reminders/:id/process` - Process reminder
- `GET /reminders/:id/logs` - Get reminder logs

**Features**:
- Reminder CRUD operations
- Scheduled reminders
- Recurring reminders
- Reminder processing
- Delivery logging
- Auto-cancellation on payment

---

### 8. Notifications Module
**Purpose**: Real-time payment notifications

**Endpoints**:
- `GET /notifications` - List notifications with filters
- `GET /notifications/summary` - Get notification summary

**Features**:
- Generate notifications from payments
- Filter by status/property
- Days overdue calculation
- Summary statistics

---

## Module Dependencies

```
AuthModule → UsersModule
PropertiesModule → UsersModule
RoomsModule → PropertiesModule, UsersModule
TenantsModule → RoomsModule, UsersModule
PaymentsModule → RoomsModule, TenantsModule, PropertiesModule, UsersModule
RemindersModule → PaymentsModule, UsersModule
NotificationsModule → PaymentsModule, UsersModule
```

## Creating a New Module

### 1. Generate module files

```bash
nest g module modules/feature-name
nest g controller modules/feature-name
nest g service modules/feature-name
```

### 2. Create DTOs

```typescript
// dto/create-feature.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFeatureDto {
  @ApiProperty({ description: 'Feature name' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
```

### 3. Create Schema

```typescript
// schemas/feature.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { baseSchemaOptions } from '@/common/database';

@Schema(baseSchemaOptions)
export class Feature extends Document {
  @Prop({ required: true })
  name: string;
}

export const FeatureSchema = SchemaFactory.createForClass(Feature);
```

### 4. Implement Service

```typescript
// feature.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Feature } from './schemas/feature.schema';
import { CreateFeatureDto } from './dto/create-feature.dto';

@Injectable()
export class FeatureService {
  constructor(
    @InjectModel(Feature.name) private featureModel: Model<Feature>,
  ) {}

  async create(createDto: CreateFeatureDto): Promise<Feature> {
    const feature = new this.featureModel(createDto);
    return feature.save();
  }
}
```

### 5. Implement Controller

```typescript
// feature.controller.ts
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards';
import { FeatureService } from './feature.service';
import { CreateFeatureDto } from './dto/create-feature.dto';

@Controller('features')
@UseGuards(JwtAuthGuard)
@ApiTags('Features')
@ApiBearerAuth()
export class FeatureController {
  constructor(private readonly featureService: FeatureService) {}

  @Post()
  @ApiOperation({ summary: 'Create feature' })
  create(@Body() createDto: CreateFeatureDto) {
    return this.featureService.create(createDto);
  }
}
```

### 6. Register in Module

```typescript
// feature.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FeatureController } from './feature.controller';
import { FeatureService } from './feature.service';
import { Feature, FeatureSchema } from './schemas/feature.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Feature.name, schema: FeatureSchema },
    ]),
  ],
  controllers: [FeatureController],
  providers: [FeatureService],
  exports: [FeatureService],
})
export class FeatureModule {}
```

## Best Practices

1. **Single Responsibility**: Each module handles one domain
2. **Dependency Injection**: Use constructor injection
3. **DTOs for Validation**: Always validate input with DTOs
4. **Error Handling**: Use NestJS exceptions
5. **Documentation**: Add Swagger decorators
6. **Testing**: Write unit and E2E tests
7. **Type Safety**: Use TypeScript strictly
8. **Async/Await**: Use async/await for database operations
9. **Transactions**: Use transactions for multi-document operations
10. **Logging**: Log important operations and errors
