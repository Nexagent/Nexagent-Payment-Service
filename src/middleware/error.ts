import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { PaymentNotFoundError, InvalidPaymentOperationError } from '../services/service';

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: 'ValidationError',
      message: 'Invalid request body',
      details: err.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
    });
    return;
  }

  if (err instanceof PaymentNotFoundError) {
    res.status(404).json({ success: false, error: err.name, message: err.message });
    return;
  }

  if (err instanceof InvalidPaymentOperationError) {
    res.status(422).json({ success: false, error: err.name, message: err.message });
    return;
  }

  console.error('[payment-service] Unhandled error:', err);
  res.status(500).json({ success: false, error: 'InternalServerError', message: 'An unexpected error occurred' });
}
