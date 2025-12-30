import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
  ValidationPipe as NestValidationPipe,
} from '@nestjs/common';

/**
 * Global validation pipe configuration
 * Validates and transforms DTOs using class-validator decorators
 */
@Injectable()
export class ValidationPipe extends NestValidationPipe implements PipeTransform {
  constructor() {
    super({
      // Automatically transform payloads to DTO instances
      transform: true,

      // Strip properties that don't have decorators
      whitelist: true,

      // Throw error if non-whitelisted properties are present
      forbidNonWhitelisted: true,

      // Throw error on unknown values
      forbidUnknownValues: true,

      // Transform primitive types
      transformOptions: {
        enableImplicitConversion: true,
      },

      // Detailed error messages
      validationError: {
        target: false,
        value: false,
      },

      // Custom exception factory for better error messages
      exceptionFactory: (errors) => {
        const messages = errors.map((error) => {
          const constraints = error.constraints;
          if (constraints) {
            return Object.values(constraints).join(', ');
          }
          return `Validation failed for ${error.property}`;
        });

        return new BadRequestException({
          statusCode: 400,
          message: messages,
          error: 'Bad Request',
        });
      },
    });
  }

  async transform(value: any, metadata: ArgumentMetadata) {
    return super.transform(value, metadata);
  }
}
