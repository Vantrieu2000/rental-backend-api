# Project Structure - Rental Management Backend API

## Overview
This is a NestJS backend API following enterprise-level architecture patterns with clean separation of concerns.

## Directory Structure

```
rental-backend-api/
│
├── src/                                    # Source code
│   ├── main.ts                            # Application entry point
│   ├── app.module.ts                      # Root module
│   ├── app.controller.ts                  # Root controller
│   ├── app.service.ts                     # Root service
│   │
│   ├── config/                            # Configuration module
│   │   ├── config.module.ts              # Config module definition
│   │   ├── config.service.ts             # Config service for env variables
│   │   ├── env.validation.ts             # Environment variable validation
│   │   └── index.ts                      # Barrel export
│   │
│   ├── common/                            # Shared utilities and cross-cutting concerns
│   │   ├── decorators/                   # Custom decorators (@CurrentUser, @Roles, etc.)
│   │   ├── filters/                      # Exception filters (AllExceptionsFilter)
│   │   ├── guards/                       # Guards (JwtAuthGuard, RolesGuard)
│   │   ├── interceptors/                 # Interceptors (LoggingInterceptor, etc.)
│   │   ├── pipes/                        # Validation pipes
│   │   ├── interfaces/                   # Shared TypeScript interfaces
│   │   ├── constants/                    # Application constants
│   │   └── database/                     # Database utilities
│   │       ├── base-schema.options.ts   # Base schema configuration
│   │       ├── base-schema.plugin.ts    # Timestamp plugin
│   │       ├── index.ts                 # Barrel export
│   │       └── README.md                # Database utilities documentation
│   │
│   └── modules/                           # Feature modules (business logic)
│       │
│       ├── auth/                         # Authentication module
│       │   ├── auth.module.ts
│       │   ├── auth.controller.ts
│       │   ├── auth.service.ts
│       │   ├── dto/                      # Data Transfer Objects
│       │   │   ├── login.dto.ts
│       │   │   ├── register.dto.ts
│       │   │   └── refresh-token.dto.ts
│       │   ├── strategies/               # Passport strategies
│       │   │   └── jwt.strategy.ts
│       │   └── guards/                   # Auth-specific guards
│       │       └── jwt-auth.guard.ts
│       │
│       ├── users/                        # User management module
│       │   ├── users.module.ts
│       │   ├── users.controller.ts
│       │   ├── users.service.ts
│       │   ├── dto/
│       │   │   ├── create-user.dto.ts
│       │   │   ├── update-user.dto.ts
│       │   │   └── user-response.dto.ts
│       │   └── schemas/
│       │       └── user.schema.ts
│       │
│       ├── properties/                   # Property management module
│       │   ├── properties.module.ts
│       │   ├── properties.controller.ts
│       │   ├── properties.service.ts
│       │   ├── dto/
│       │   │   ├── create-property.dto.ts
│       │   │   ├── update-property.dto.ts
│       │   │   ├── property-filters.dto.ts
│       │   │   └── property-statistics.dto.ts
│       │   └── schemas/
│       │       └── property.schema.ts
│       │
│       ├── rooms/                        # Room management module
│       │   ├── rooms.module.ts
│       │   ├── rooms.controller.ts
│       │   ├── rooms.service.ts
│       │   ├── dto/
│       │   │   ├── create-room.dto.ts
│       │   │   ├── update-room.dto.ts
│       │   │   ├── room-filters.dto.ts
│       │   │   ├── assign-tenant.dto.ts
│       │   │   └── vacate-room.dto.ts
│       │   └── schemas/
│       │       └── room.schema.ts
│       │
│       ├── tenants/                      # Tenant management module
│       │   ├── tenants.module.ts
│       │   ├── tenants.controller.ts
│       │   ├── tenants.service.ts
│       │   ├── dto/
│       │   │   ├── create-tenant.dto.ts
│       │   │   ├── update-tenant.dto.ts
│       │   │   ├── tenant-filters.dto.ts
│       │   │   ├── assign-tenant.dto.ts
│       │   │   └── vacate-tenant.dto.ts
│       │   └── schemas/
│       │       ├── tenant.schema.ts
│       │       └── tenant-history.schema.ts
│       │
│       ├── payments/                     # Payment management module
│       │   ├── payments.module.ts
│       │   ├── payments.controller.ts
│       │   ├── payments.service.ts
│       │   ├── dto/
│       │   │   ├── create-payment.dto.ts
│       │   │   ├── mark-paid.dto.ts
│       │   │   ├── payment-filters.dto.ts
│       │   │   ├── fee-calculation.dto.ts
│       │   │   └── payment-statistics.dto.ts
│       │   └── schemas/
│       │       └── payment.schema.ts
│       │
│       ├── reminders/                    # Reminder management module
│       │   ├── reminders.module.ts
│       │   ├── reminders.controller.ts
│       │   ├── reminders.service.ts
│       │   ├── dto/
│       │   │   ├── create-reminder.dto.ts
│       │   │   ├── update-reminder.dto.ts
│       │   │   ├── reminder-filters.dto.ts
│       │   │   └── process-reminder.dto.ts
│       │   └── schemas/
│       │       ├── reminder.schema.ts
│       │       └── reminder-log.schema.ts
│       │
│       └── notifications/                # Notification module
│           ├── notifications.module.ts
│           ├── notifications.controller.ts
│           ├── notifications.service.ts
│           └── dto/
│               ├── notification.dto.ts
│               ├── notification-filters.dto.ts
│               └── notification-summary.dto.ts
│
├── test/                                  # Test files
│   ├── unit/                             # Unit tests
│   │   ├── auth/
│   │   ├── users/
│   │   ├── properties/
│   │   ├── rooms/
│   │   ├── tenants/
│   │   ├── payments/
│   │   ├── reminders/
│   │   └── notifications/
│   │
│   ├── property/                         # Property-based tests
│   │   ├── auth.pbt.spec.ts
│   │   ├── properties.pbt.spec.ts
│   │   ├── rooms.pbt.spec.ts
│   │   ├── tenants.pbt.spec.ts
│   │   ├── payments.pbt.spec.ts
│   │   ├── reminders.pbt.spec.ts
│   │   └── notifications.pbt.spec.ts
│   │
│   ├── e2e/                              # End-to-end tests
│   │   ├── auth.e2e-spec.ts
│   │   ├── properties.e2e-spec.ts
│   │   ├── rooms.e2e-spec.ts
│   │   ├── tenants.e2e-spec.ts
│   │   ├── payments.e2e-spec.ts
│   │   ├── reminders.e2e-spec.ts
│   │   └── notifications.e2e-spec.ts
│   │
│   ├── fixtures/                         # Test data generators
│   │   ├── user.fixture.ts
│   │   ├── property.fixture.ts
│   │   ├── room.fixture.ts
│   │   ├── tenant.fixture.ts
│   │   ├── payment.fixture.ts
│   │   └── reminder.fixture.ts
│   │
│   ├── app.e2e-spec.ts                  # Root E2E test
│   └── jest-e2e.json                    # E2E Jest configuration
│
├── dist/                                  # Compiled output (generated)
├── node_modules/                          # Dependencies (generated)
│
├── .env                                   # Environment variables (local)
├── .env.example                           # Environment variables template
├── .gitignore                            # Git ignore rules
├── .prettierrc                           # Prettier configuration
├── eslint.config.mjs                     # ESLint configuration
├── nest-cli.json                         # NestJS CLI configuration
├── package.json                          # NPM dependencies and scripts
├── package-lock.json                     # NPM lock file
├── tsconfig.json                         # TypeScript configuration
├── tsconfig.build.json                   # TypeScript build configuration
├── PROJECT_STRUCTURE.md                  # This file
└── README.md                             # Project documentation
```

## Architecture Principles

### 1. Separation of Concerns
- **modules/**: Business logic organized by domain (auth, users, properties, etc.)
- **common/**: Shared utilities used across modules
- **config/**: Application configuration and environment management

### 2. Layered Architecture
Each module follows a consistent structure:
- **Controller**: HTTP request/response handling
- **Service**: Business logic implementation
- **DTO**: Data validation and transformation
- **Schema**: Database models (Mongoose schemas)

### 3. Dependency Injection
- All services use NestJS dependency injection
- Modules declare their dependencies explicitly
- Easy to test and maintain

### 4. Testing Strategy
- **Unit Tests**: Test individual components in isolation
- **Property-Based Tests**: Test universal properties with generated inputs
- **E2E Tests**: Test complete user flows
- **Fixtures**: Reusable test data generators

## Module Dependencies

```
AppModule
├── ConfigModule (Global)
├── MongooseModule (Global)
├── AuthModule
│   └── UsersModule
├── UsersModule
├── PropertiesModule
│   └── UsersModule
├── RoomsModule
│   ├── PropertiesModule
│   └── UsersModule
├── TenantsModule
│   ├── RoomsModule
│   └── UsersModule
├── PaymentsModule
│   ├── RoomsModule
│   ├── TenantsModule
│   ├── PropertiesModule
│   └── UsersModule
├── RemindersModule
│   ├── PaymentsModule
│   └── UsersModule
└── NotificationsModule
    ├── PaymentsModule
    └── UsersModule
```

## Naming Conventions

### Files
- **Modules**: `*.module.ts` (e.g., `auth.module.ts`)
- **Controllers**: `*.controller.ts` (e.g., `auth.controller.ts`)
- **Services**: `*.service.ts` (e.g., `auth.service.ts`)
- **DTOs**: `*.dto.ts` (e.g., `create-user.dto.ts`)
- **Schemas**: `*.schema.ts` (e.g., `user.schema.ts`)
- **Guards**: `*.guard.ts` (e.g., `jwt-auth.guard.ts`)
- **Strategies**: `*.strategy.ts` (e.g., `jwt.strategy.ts`)
- **Filters**: `*.filter.ts` (e.g., `all-exceptions.filter.ts`)
- **Interceptors**: `*.interceptor.ts` (e.g., `logging.interceptor.ts`)
- **Pipes**: `*.pipe.ts` (e.g., `validation.pipe.ts`)

### Classes
- **Modules**: `PascalCase` + `Module` (e.g., `AuthModule`)
- **Controllers**: `PascalCase` + `Controller` (e.g., `AuthController`)
- **Services**: `PascalCase` + `Service` (e.g., `AuthService`)
- **DTOs**: `PascalCase` + `Dto` (e.g., `CreateUserDto`)
- **Schemas**: `PascalCase` (e.g., `User`, `Property`)

### Variables
- **camelCase** for variables and functions
- **UPPER_SNAKE_CASE** for constants
- **PascalCase** for classes and interfaces

## Best Practices

1. **Single Responsibility**: Each file has one clear purpose
2. **DRY (Don't Repeat Yourself)**: Shared code in `common/`
3. **Explicit Dependencies**: Use dependency injection
4. **Type Safety**: Use TypeScript strictly
5. **Validation**: Use DTOs with class-validator
6. **Error Handling**: Use exception filters
7. **Documentation**: Use Swagger decorators
8. **Testing**: Write tests for all business logic
9. **Security**: Use guards, helmet, rate limiting
10. **Clean Code**: Follow ESLint and Prettier rules

## Getting Started

See [README.md](./README.md) for setup instructions and development guidelines.
