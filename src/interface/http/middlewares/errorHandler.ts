import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(
  err: Error | ZodError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Error:', err);

  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation error',
      details: err.errors,
    });
    return;
  }

  if (err.message === 'Email already in use') {
    res.status(409).json({ error: err.message });
    return;
  }

  if (err.message === 'Invalid credentials') {
    res.status(401).json({ error: err.message });
    return;
  }

  if (err.message.includes('token') || err.message.includes('Token')) {
    res.status(400).json({ error: err.message });
    return;
  }

  if (err.message === 'User not found') {
    res.status(404).json({ error: err.message });
    return;
  }

  if (err.message === 'Plan not found') {
    res.status(404).json({ error: err.message });
    return;
  }

  res.status(500).json({ error: 'Internal server error' });
}

