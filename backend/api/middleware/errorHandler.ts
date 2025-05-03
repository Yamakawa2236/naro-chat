import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  console.error('Unhandled Error:', err.stack || err);

  const statusCode = 500;
  const errorMessage = process.env.NODE_ENV === 'production'
    ? 'An unexpected server error occurred.'
    : err.message || 'Internal Server Error';

  if (res.headersSent) {
    return next(err);
  }

  res.status(statusCode).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: errorMessage,
  });
};