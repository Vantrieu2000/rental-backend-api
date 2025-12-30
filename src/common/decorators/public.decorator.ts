import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key for public routes
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Custom decorator to mark an endpoint as public (skip authentication)
 * Usage: @Public()
 *
 * This decorator sets metadata that will be read by the JwtAuthGuard
 * to skip authentication for specific endpoints (e.g., login, register)
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
