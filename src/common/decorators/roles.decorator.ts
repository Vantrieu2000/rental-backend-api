import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key for roles
 */
export const ROLES_KEY = 'roles';

/**
 * Custom decorator to define required roles for an endpoint
 * Usage: @Roles('owner', 'manager')
 *
 * This decorator sets metadata that will be read by the RolesGuard
 * to determine if the current user has the required role
 *
 * @param roles - Array of role names that are allowed to access the endpoint
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
