/**
 * Pagination options for list queries
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
  skip?: number;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
