/**
 * User payload interface for JWT token and request context
 */
export interface UserPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * JWT payload interface for token generation
 */
export interface JwtPayload {
  sub: string; // User ID
  email: string;
  role: string;
  iat?: number; // Issued at
  exp?: number; // Expiration time
}
