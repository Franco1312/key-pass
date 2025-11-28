import { Response, NextFunction } from 'express';
import { UserRole } from '@domain/entities/User';
import { AuthenticatedRequest } from '@interface/http/middlewares/requireAuth';

export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    next();
  };
}

