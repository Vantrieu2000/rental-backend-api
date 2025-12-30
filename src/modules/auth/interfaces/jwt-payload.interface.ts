export interface JwtPayload {
  sub: string; // User ID
  email: string;
  role: string;
  iat?: number; // Issued at
  exp?: number; // Expiration time
  [key: string]: any; // Allow additional properties
}

export interface UserPayload {
  userId: string;
  email: string;
  role: string;
}
