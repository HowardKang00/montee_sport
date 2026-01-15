import { type Request, type Response, type NextFunction } from 'express';

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  // Assumes req.user is set by authentication middleware
  if (req.user && (req.user as any).role === 'ADMIN') {
    return next();
  }
  return res.status(403).json({ error: 'Admin access required' });
}
