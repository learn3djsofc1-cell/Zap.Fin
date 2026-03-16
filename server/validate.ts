import { Response } from 'express';

export function parseIntId(value: string): number | null {
  const num = parseInt(value, 10);
  if (isNaN(num) || num <= 0 || String(num) !== value) {
    return null;
  }
  return num;
}

export function sendInvalidId(res: Response): void {
  res.status(400).json({ error: 'Invalid ID format' });
}
