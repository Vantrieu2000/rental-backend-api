# Architecture Overview

## 🏛️ Clean Architecture Principles

This project follows **Clean Architecture** with clear separation of concerns and dependency rules.

### Dependency Rule

```
┌─────────────────────────────────────────────┐
│         External Interfaces                 │
│    (Controllers, HTTP, Database)            │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         Application Layer                   │
│    (Use Cases, Business Logic)              │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         Domain Layer                        │
│    (Entities, Business Rules)               │
└─────────────────────────────────────────────┘
```

**Rule**: Dependencies point inward. Inner layers don't know about outer layers.

---

## 📁 Directory Structure Philosophy

### 1. **src/modules/** - Feature Modules (Business Logic)
Each module represents a **bounded context** in Domain-Driven Design:

- **Self-contained**: Each module has its own controllers, services, DTOs, and schemas
- **Single Responsibility**: Each module handles one domain (auth, users, properties, etc.)
- **Explicit Dependencies**: Modules declare dependencies through imports
- **Testable**: Easy to test in isolation

**Example**: `modules/properties/`
- Handles all property-related business logic
- Depends on `UsersModule` for ownership validation
- Exports `PropertiesService` for other modules to use

### 2. **src/common/** - Shared Utilities (Cross-Cutting Concerns)
Reusable code that doesn't belong to any specific domain:

- **decorators/**: Custom decorators (`@CurrentUser`, `@Roles`)
- **filters/**: Exception filters for error handling
- **guards/**: Authentication and authorization guards
- **interceptors/**: Request/response transformation
- **pipes/**: Validation and transformation pipes
- **interfaces/**: Shared TypeScript interfaces
- **constants/**: Application-wide constants
- **database/**: Database utilities and base schemas

**Rule**: No business logic in common. Only generic, reusable utilities.

### 3. **src/config/** - Configuration Management
Environment-specific configuration:

- **config.service.ts**: Type-safe access to environment variables
- **env.validation.ts**: Validation schema for environment variables
- **config.module.ts**: Global configuration module

**Benefits**:
- Type-safe configuration access
- Validation on startup
- Easy to test with different configurations

### 4. **test/** - Testing
Organized by testing strategy:

- **unit/**: Test individual components
- **property/**: Property-based tests for universal properties
- **e2e/**: End-to-end tests for complete flows
- **fixtures/**: Test data generators

---

## 🔄 Request Flow

### 1. HTTP Request → Controller
```typescript
@Controller('properties')
@UseGuards(JwtAuthGuard)
export class PropertiesController {
  @Get()
  async findAll(@CurrentUser() user: UserPayload) {
    return this.propertiesService.findAll(user.userId);
  }
}
```

**Responsibilities**:
- HTTP request/response handling
- Input validation (DTOs)
- Authentication/authorization (Guards)
- Route definition

### 2. Controller → Service
```typescript
@Injectable()
export class PropertiesService {
  constructor(
    @InjectModel(Property.name) private propertyModel: Model<Property>,
  ) {}

  async findAll(userId: string): Promise<Property[]> {
    return this.propertyModel.find({ ownerId: userId }).exec();
  }
}
```

**Responsibilities**:
- Business logic implementation
- Data validation
- Database operations
- Error handling

### 3. Service → Database
```typescript
@Schema(baseSchemaOptions)
export class Property extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId: Types.ObjectId;
}
```

**Responsibilities**:
- Data structure definition
- Validation rules
- Relationships
- Indexes

---

## 🔐 Security Layers

### 1. Authentication (JwtAuthGuard)
```typescript
@UseGuards(JwtAuthGuard)
```
- Validates JWT token
- Extracts user information
- Attaches user to request

### 2. Authorization (RolesGuard)
```typescript
@Roles('owner', 'manager')
@UseGuards(JwtAuthGuard, RolesGuard)
```
- Checks user roles
- Enforces role-based access control

### 3. Validation (ValidationPipe)
```typescript
@Post()
async create(@Body() createDto: CreatePropertyDto) {
  // DTO is validated automatically
}
```
- Validates request body
- Transforms data types
- Sanitizes input

### 4. Error Handling (AllExceptionsFilter)
```typescript
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // Handle all exceptions consistently
  }
}
```
- Catches all exceptions
- Formats error responses
- Logs errors

---

## 📊 Data Flow

### Create Property Example

```
1. Client Request
   POST /properties
   Authorization: Bearer <token>
   Body: { name: "Building A", address: "123 Main St", ... }
   
2. Middleware Pipeline
   → CORS Check
   → Rate Limiting
   → Helmet Security Headers
   → Body Parser
   
3. Guards
   → JwtAuthGuard: Validate token, extract user
   → RolesGuard: Check user role
   
4. Controller
   → PropertiesController.create()
   → Validate DTO (CreatePropertyDto)
   → Extract user from request
   
5. Service
   → PropertiesService.create()
   → Add ownerId from user
   → Validate business rules
   → Save to database
   
6. Database
   → Mongoose validates schema
   → Apply timestamps
   → Save document
   → Return saved property
   
7. Response
   → Transform to JSON
   → Remove sensitive fields
   → Send to client
```

---

## 🧩 Module Dependencies

### Dependency Graph

```
AppModule
├── ConfigModule (Global)
│   └── Provides: AppConfigService
│
├── MongooseModule (Global)
│   └── Provides: Database connection
│
├── AuthModule
│   ├── Imports: UsersModule
│   └── Exports: AuthService, JwtStrategy
│
├── UsersModule
│   └── Exports: UsersService
│
├── PropertiesModule
│   ├── Imports: UsersModule
│   └── Exports: PropertiesService
│
├── RoomsModule
│   ├── Imports: PropertiesModule, UsersModule
│   └── Exports: RoomsService
│
├── TenantsModule
│   ├── Imports: RoomsModule, UsersModule
│   └── Exports: TenantsService
│
├── PaymentsModule
│   ├── Imports: RoomsModule, TenantsModule, PropertiesModule, UsersModule
│   └── Exports: PaymentsService
│
├── RemindersModule
│   ├── Imports: PaymentsModule, UsersModule
│   └── Exports: RemindersService
│
└── NotificationsModule
    ├── Imports: PaymentsModule, UsersModule
    └── Exports: NotificationsService
```

### Dependency Rules

1. **No Circular Dependencies**: Modules cannot depend on each other circularly
2. **Explicit Imports**: All dependencies must be declared in module imports
3. **Export Services**: Services that other modules need must be exported
4. **Inject Services**: Use constructor injection for dependencies

---

## 🎯 Design Patterns

### 1. Dependency Injection
```typescript
@Injectable()
export class PropertiesService {
  constructor(
    @InjectModel(Property.name) private propertyModel: Model<Property>,
    private usersService: UsersService,
  ) {}
}
```

**Benefits**:
- Loose coupling
- Easy testing (mock dependencies)
- Flexible configuration

### 2. Repository Pattern
```typescript
@InjectModel(Property.name) private propertyModel: Model<Property>
```

**Benefits**:
- Abstraction over data access
- Easy to switch databases
- Testable with mock repositories

### 3. DTO Pattern
```typescript
export class CreatePropertyDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
```

**Benefits**:
- Input validation
- Type safety
- Documentation (Swagger)

### 4. Guard Pattern
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
```

**Benefits**:
- Reusable authorization logic
- Declarative security
- Easy to test

### 5. Filter Pattern
```typescript
@Catch()
export class AllExceptionsFilter implements ExceptionFilter
```

**Benefits**:
- Consistent error handling
- Centralized error logging
- Clean error responses

---

## 🧪 Testing Strategy

### Test Pyramid

```
        /\
       /  \
      / E2E \
     /--------\
    /          \
   /  Property  \
  /--------------\
 /                \
/      Unit        \
--------------------
```

### 1. Unit Tests (Base)
- Test individual functions/methods
- Mock dependencies
- Fast execution
- High coverage

### 2. Property-Based Tests (Middle)
- Test universal properties
- Generate random inputs
- Catch edge cases
- Verify invariants

### 3. E2E Tests (Top)
- Test complete flows
- Real database
- HTTP requests
- Integration validation

---

## 📈 Scalability Considerations

### Horizontal Scaling
- **Stateless**: No session state in application
- **JWT**: Token-based authentication
- **MongoDB**: Sharding support
- **Load Balancer**: Multiple instances

### Vertical Scaling
- **Async Operations**: Non-blocking I/O
- **Connection Pooling**: Reuse database connections
- **Caching**: Redis for frequently accessed data
- **Indexing**: Optimize database queries

### Performance Optimization
- **Pagination**: Limit query results
- **Projection**: Select only needed fields
- **Aggregation**: Database-level calculations
- **Lazy Loading**: Load related data on demand

---

## 🔒 Security Best Practices

### 1. Authentication
- JWT with short expiration (15 minutes)
- Refresh tokens for long sessions
- Secure token storage
- Token revocation support

### 2. Authorization
- Role-based access control (RBAC)
- Resource ownership validation
- Principle of least privilege

### 3. Input Validation
- DTO validation with class-validator
- Sanitize user input
- Prevent NoSQL injection
- Type checking

### 4. Security Headers
- Helmet middleware
- CORS configuration
- CSP headers
- HSTS

### 5. Rate Limiting
- Prevent brute force attacks
- Throttle API requests
- Per-user limits

---

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [MongoDB Best Practices](https://docs.mongodb.com/manual/administration/production-notes/)
