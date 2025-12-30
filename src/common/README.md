# Common Module

Shared utilities and cross-cutting concerns used across all feature modules.

## Structure

```
common/
├── decorators/       # Custom decorators
├── filters/          # Exception filters
├── guards/           # Authentication & authorization guards
├── interceptors/     # Request/response interceptors
├── pipes/            # Validation pipes
├── interfaces/       # Shared TypeScript interfaces
├── constants/        # Application constants
└── database/         # Database utilities
```

## Decorators

Custom decorators for common functionality:

- `@CurrentUser()`: Extract current user from request
- `@Roles()`: Define required roles for endpoints
- `@Public()`: Mark endpoints as public (skip auth)

## Filters

Exception filters for consistent error handling:

- `AllExceptionsFilter`: Global exception handler
- `HttpExceptionFilter`: HTTP-specific exception handler
- `ValidationExceptionFilter`: Validation error handler

## Guards

Guards for authentication and authorization:

- `JwtAuthGuard`: JWT token validation
- `RolesGuard`: Role-based access control
- `ThrottlerGuard`: Rate limiting

## Interceptors

Interceptors for request/response transformation:

- `LoggingInterceptor`: Request/response logging
- `TransformInterceptor`: Response transformation
- `TimeoutInterceptor`: Request timeout handling

## Pipes

Validation pipes for data transformation:

- `ValidationPipe`: DTO validation
- `ParseIntPipe`: Parse string to integer
- `ParseObjectIdPipe`: Parse string to MongoDB ObjectId

## Interfaces

Shared TypeScript interfaces:

- `JwtPayload`: JWT token payload structure
- `UserPayload`: User information in request
- `PaginationOptions`: Pagination parameters
- `FilterOptions`: Filtering parameters

## Constants

Application-wide constants:

- `ROLES`: User role definitions
- `ERROR_MESSAGES`: Standard error messages
- `VALIDATION_MESSAGES`: Validation error messages

## Database

Database utilities and configurations:

See [database/README.md](./database/README.md) for details.

## Usage Examples

### Using Custom Decorators

```typescript
import { Controller, Get } from '@nestjs/common';
import { CurrentUser, Roles } from '@/common/decorators';
import { UserPayload } from '@/common/interfaces';

@Controller('users')
export class UsersController {
  @Get('profile')
  @Roles('owner', 'manager')
  getProfile(@CurrentUser() user: UserPayload) {
    return user;
  }
}
```

### Using Guards

```typescript
import { Controller, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, RolesGuard } from '@/common/guards';

@Controller('properties')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PropertiesController {
  // All endpoints require authentication and role check
}
```

### Using Filters

```typescript
import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from '@/common/filters';

@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
```

## Best Practices

1. **Keep it Generic**: Common utilities should be reusable across modules
2. **No Business Logic**: Business logic belongs in feature modules
3. **Well Documented**: Document all utilities with JSDoc comments
4. **Type Safe**: Use TypeScript types and interfaces
5. **Tested**: Write unit tests for all utilities
