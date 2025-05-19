export interface ErrorResponse {
  error: string;
  code: string;
  details?: unknown;
}

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleError(error: unknown): ErrorResponse {
  if (error instanceof AppError) {
    return {
      error: error.message,
      code: error.code,
      details: error.details
    };
  }
  
  if (error instanceof Error) {
    return {
      error: error.message,
      code: 'INTERNAL_ERROR',
      details: error.stack
    };
  }
  
  return {
    error: 'Unknown error occurred',
    code: 'UNKNOWN_ERROR'
  };
}

export const ErrorCodes = {
  INVALID_SIGNATURE: 'INVALID_SIGNATURE',
  MISSING_ENV_VAR: 'MISSING_ENV_VAR',
  INVALID_POSTBACK: 'INVALID_POSTBACK',
  QUIZ_NOT_FOUND: 'QUIZ_NOT_FOUND',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
} as const; 