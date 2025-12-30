/**
 * Standard error messages used across the application
 */
export const ERROR_MESSAGES = {
  // Authentication errors
  INVALID_CREDENTIALS: 'Invalid email or password',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Forbidden - insufficient permissions',
  TOKEN_EXPIRED: 'Token has expired',
  INVALID_TOKEN: 'Invalid token',

  // Validation errors
  VALIDATION_FAILED: 'Validation failed',
  INVALID_INPUT: 'Invalid input data',
  REQUIRED_FIELD: 'This field is required',

  // Resource errors
  NOT_FOUND: 'Resource not found',
  ALREADY_EXISTS: 'Resource already exists',
  DUPLICATE_EMAIL: 'Email already exists',

  // Ownership errors
  NOT_OWNER: 'You do not own this resource',
  OWNERSHIP_REQUIRED: 'Ownership verification required',

  // Business logic errors
  PROPERTY_HAS_ROOMS: 'Cannot delete property with existing rooms',
  ROOM_OCCUPIED: 'Room is currently occupied',
  TENANT_ALREADY_ASSIGNED: 'Tenant is already assigned to a room',
  PAYMENT_ALREADY_PAID: 'Payment has already been marked as paid',

  // Server errors
  INTERNAL_ERROR: 'Internal server error',
  DATABASE_ERROR: 'Database operation failed',
  UNKNOWN_ERROR: 'An unexpected error occurred',
} as const;
