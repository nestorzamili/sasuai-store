/**
 * Common pagination parameters used across the application
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Standard API response format with pagination metadata
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/**
 * Generic API response for error handling
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
