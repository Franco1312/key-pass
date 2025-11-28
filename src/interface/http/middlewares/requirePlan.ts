import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@interface/http/middlewares/requireAuth';

export function requirePlan(allowedPlans: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!allowedPlans.includes(req.user.plan)) {
      res.status(403).json({ error: 'Forbidden: Plan upgrade required' });
      return;
    }

    next();
  };
}

