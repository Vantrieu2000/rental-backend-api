import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { EnvironmentVariables } from './env.validation';

@Injectable()
export class AppConfigService {
  constructor(
    private configService: NestConfigService<EnvironmentVariables, true>,
  ) {}

  get databaseUrl(): string {
    return this.configService.get('DATABASE_URL', { infer: true });
  }

  get jwtSecret(): string {
    return this.configService.get('JWT_SECRET', { infer: true });
  }

  get jwtRefreshSecret(): string {
    return this.configService.get('JWT_REFRESH_SECRET', { infer: true });
  }

  get jwtExpiration(): string {
    return this.configService.get('JWT_EXPIRATION', { infer: true });
  }

  get jwtRefreshExpiration(): string {
    return this.configService.get('JWT_REFRESH_EXPIRATION', { infer: true });
  }

  get port(): number {
    return this.configService.get('PORT', { infer: true });
  }

  get nodeEnv(): string {
    return this.configService.get('NODE_ENV', { infer: true });
  }

  get allowedOrigins(): string[] {
    const origins = this.configService.get('ALLOWED_ORIGINS', { infer: true });
    return origins.split(',').map((origin) => origin.trim());
  }

  get rateLimitTtl(): number {
    return this.configService.get('RATE_LIMIT_TTL', { infer: true });
  }

  get rateLimitMax(): number {
    return this.configService.get('RATE_LIMIT_MAX', { infer: true });
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get isTest(): boolean {
    return this.nodeEnv === 'test';
  }
}
