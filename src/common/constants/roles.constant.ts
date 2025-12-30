/**
 * User role definitions
 */
export enum UserRole {
  OWNER = 'owner',
  MANAGER = 'manager',
  STAFF = 'staff',
}

/**
 * Array of all valid roles
 */
export const ALL_ROLES = Object.values(UserRole);
