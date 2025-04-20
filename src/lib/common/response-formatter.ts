interface ResponseFormatter<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
export function responseFormatter<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): ResponseFormatter<T> {
  const currentPage = Math.floor(page / limit) + 1;
  return {
    data,
    meta: {
      total,
      page: currentPage,
      limit,
      totalPages: Math.ceil(total / (limit || 1)),
    },
  };
}
export interface ErrorResponse {
  success: false;
  message: string;
  error?: {
    code?: string | number;
    details?: unknown;
  };
}

export function errorHandling(
  options: {
    message?: string;
    code?: string | number;
    details?: unknown;
  } = {}
): ErrorResponse {
  return {
    success: false,
    message:
      options.message || 'An error occurred while processing your request.',
    error:
      options.code || options.details
        ? {
            ...(options.code ? { code: options.code } : {}),
            ...(options.details !== undefined
              ? { details: options.details }
              : {}),
          }
        : undefined,
  };
}
