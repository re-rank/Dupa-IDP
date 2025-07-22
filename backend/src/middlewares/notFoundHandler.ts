/**
 * 404 Not Found Handler Middleware
 */

import { Request, Response, NextFunction } from 'express';
import { NotFoundError } from './errorHandler';

/**
 * Handles requests to non-existent routes
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = new NotFoundError(`Route ${req.method} ${req.originalUrl}`);
  next(error);
};