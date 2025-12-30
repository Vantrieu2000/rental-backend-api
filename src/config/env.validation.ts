import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsEnum,
} from 'class-validator';
import { Transform } from 'class-transformer';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  // Required variables
  @IsString()
  @IsNotEmpty()
  DATABASE_URL: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET: string;

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_SECRET: string;

  // Optional variables with defaults
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(65535)
  @Transform(({ value }) => parseInt(value, 10))
  PORT: number = 3000;

  @IsOptional()
  @IsEnum(Environment)
  NODE_ENV: Environment = Environment.Development;

  @IsOptional()
  @IsString()
  JWT_EXPIRATION: string = '15m';

  @IsOptional()
  @IsString()
  JWT_REFRESH_EXPIRATION: string = '7d';

  @IsOptional()
  @IsString()
  ALLOWED_ORIGINS: string = 'http://localhost:19006';

  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value, 10))
  RATE_LIMIT_TTL: number = 900;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value, 10))
  RATE_LIMIT_MAX: number = 100;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = new EnvironmentVariables();
  Object.assign(validatedConfig, config);

  // Apply defaults for optional fields if not provided
  if (!config.PORT) {
    validatedConfig.PORT = 3000;
  }
  if (!config.NODE_ENV) {
    validatedConfig.NODE_ENV = Environment.Development;
  }
  if (!config.JWT_EXPIRATION) {
    validatedConfig.JWT_EXPIRATION = '15m';
  }
  if (!config.JWT_REFRESH_EXPIRATION) {
    validatedConfig.JWT_REFRESH_EXPIRATION = '7d';
  }
  if (!config.ALLOWED_ORIGINS) {
    validatedConfig.ALLOWED_ORIGINS = 'http://localhost:19006';
  }
  if (!config.RATE_LIMIT_TTL) {
    validatedConfig.RATE_LIMIT_TTL = 900;
  }
  if (!config.RATE_LIMIT_MAX) {
    validatedConfig.RATE_LIMIT_MAX = 100;
  }

  return validatedConfig;
}
