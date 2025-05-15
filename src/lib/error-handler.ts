type ErrorWithMessage = {
  message?: string;
  code?: string;
  statusCode?: number;
  status?: number;
  error?: unknown;
};

/**
 * Extracts a readable error message from various error objects
 */
export function extractErrorMessage(error: unknown): string {
  if (!error) return 'An unknown error occurred';

  if (typeof error === 'string') return error;

  const errorObj = error as ErrorWithMessage;

  if (errorObj.message) return errorObj.message;

  // Check for nested error object
  if (
    errorObj.error &&
    typeof errorObj.error === 'object' &&
    'message' in errorObj.error
  ) {
    return String(errorObj.error.message);
  }

  return 'An unexpected error occurred';
}

/**
 * Map common status codes to user-friendly messages
 */
export function getStatusCodeMessage(statusCode: number): string | null {
  const statusCodeMessages: Record<number, string> = {
    400: 'Invalid request. Please check your input and try again.',
    401: 'Invalid credentials. Please try again.',
    403: 'Please verify your email address before signing in.',
    404: 'Resource not found.',
    422: 'Validation error. Please check your input.',
    423: 'Your account has been blocked. Please contact support.',
    429: 'Too many attempts. Please try again later.',
    500: 'Server error. Please try again later.',
  };

  return statusCodeMessages[statusCode] || null;
}

/**
 * Standardized error handler for authentication errors
 */
export function handleAuthError(error: ErrorWithMessage): string {
  // Common auth error codes
  const errorMap: Record<string, string> = {
    AuthUserAlreadyExists: 'This email address is already registered.',
    AuthInvalidEmail: 'Please provide a valid email address.',
    AuthWeakPassword:
      'Password is too weak. Please choose a stronger password.',
    AuthInvalidCredentials: 'Invalid credentials. Please try again.',
    AuthEmailNotVerified: 'Please verify your email address before signing in.',
    AuthUserBlocked: 'Your account has been blocked. Please contact support.',
    AuthTooManyRequests: 'Too many attempts. Please try again later.',
  };

  // Try to match by error code
  if (error.code && errorMap[error.code]) {
    return errorMap[error.code];
  }

  // Try to match by status code
  const statusCode = error.statusCode || error.status;
  if (statusCode) {
    const statusCodeMessage = getStatusCodeMessage(statusCode);
    if (statusCodeMessage) {
      return statusCodeMessage;
    }
  }

  // Fallback to message or default
  return error.message || 'Authentication failed. Please try again.';
}
