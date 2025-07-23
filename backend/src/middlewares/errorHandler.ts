/**
 * Error Handling Middleware
 * 
 * Provides centralized error handling for the application
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { ValidationError } from 'joi';
import { MulterError } from 'multer';

/**
 * Custom application error class
 */
export class AppError extends Error {
  public readonly isOperational: boolean;
  public readonly statusCode: number;
  public readonly code?: string;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    code?: string,
    details?: any,
    isOperational: boolean = true
  ) {
    super(message);
    
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = isOperational;
    
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Common error types
 */
export class ValidationAppError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'TOO_MANY_REQUESTS');
  }
}

/**
 * Error response interface
 */
interface ErrorResponse {
  error: {
    message: string;
    code?: string;
    status: number;
    timestamp: string;
    path?: string;
    method?: string;
    details?: any;
    requestId?: string;
  };
}

/**
 * Determines if error details should be sent to client
 */
function shouldSendDetails(err: any, env: string): boolean {
  // Always send details in development
  if (env === 'development') return true;
  
  // Send details for operational errors
  if (err instanceof AppError && err.isOperational) return true;
  
  // Send details for validation errors
  if (err instanceof ValidationError) return true;
  
  return false;
}

/**
 * Formats error for logging
 */
function formatErrorForLogging(err: any, req: Request): any {
  return {
    error: {
      message: err.message,
      stack: err.stack,
      code: err.code,
      statusCode: err.statusCode || 500,
    },
    request: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      query: req.query,
      body: req.body,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Main error handling middleware
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Default error values
  let statusCode = 500;
  let message = 'Internal Server Error';
  let code = 'INTERNAL_ERROR';
  let details: any = undefined;

  // Handle different error types
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code || code;
    details = err.details;
  } else if (err instanceof ValidationError) {
    statusCode = 400;
    message = 'Validation Error';
    code = 'VALIDATION_ERROR';
    details = err.details.map((detail: any) => ({
      field: detail.path.join('.'),
      message: detail.message,
    }));
  } else if (err instanceof MulterError) {
    statusCode = 400;
    code = 'FILE_UPLOAD_ERROR';
    
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'File size too large';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Unexpected file field';
        break;
      default:
        message = 'File upload error';
    }
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
    code = 'INVALID_ID';
  } else if (err.name === 'MongoError' && (err as any).code === 11000) {
    statusCode = 409;
    message = 'Duplicate entry';
    code = 'DUPLICATE_ERROR';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    code = 'INVALID_TOKEN';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    code = 'TOKEN_EXPIRED';
  }

  // Log error
  const logData = formatErrorForLogging(err, req);
  
  if (statusCode >= 500) {
    logger.error('Server Error:', logData);
  } else {
    logger.warn('Client Error:', logData);
  }

  // Prepare error response
  const errorResponse: ErrorResponse = {
    error: {
      message,
      code,
      status: statusCode,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    },
  };

  // Add details if appropriate
  if (shouldSendDetails(err, process.env.NODE_ENV || 'production')) {
    errorResponse.error.details = details;
  }

  // Add request ID if available
  if ((req as any).id) {
    errorResponse.error.requestId = (req as any).id;
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
};

/**
 * Async error wrapper for route handlers
 */
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const err = new NotFoundError(`Route ${req.method} ${req.path}`);
  next(err);
};