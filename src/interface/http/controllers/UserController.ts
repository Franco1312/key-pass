import { Response, NextFunction } from 'express';
import { GetCurrentUserUseCase } from '@application/use-cases/GetCurrentUserUseCase';
import { UpgradePlanUseCase } from '@application/use-cases/UpgradePlanUseCase';
import { DowngradePlanUseCase } from '@application/use-cases/DowngradePlanUseCase';
import { AuthenticatedRequest } from '@interface/http/middlewares/requireAuth';
import { upgradePlanSchema, downgradePlanSchema } from '@interface/http/schemas/userSchemas';

export class UserController {
  constructor(
    private getCurrentUserUseCase: GetCurrentUserUseCase,
    private upgradePlanUseCase: UpgradePlanUseCase,
    private downgradePlanUseCase: DowngradePlanUseCase
  ) {}

  async getCurrentUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const result = await this.getCurrentUserUseCase.execute(req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async upgradePlan(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const body = upgradePlanSchema.parse(req.body);
      await this.upgradePlanUseCase.execute({
        userId: req.user.id,
        planCode: body.planCode,
      });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async downgradePlan(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const body = downgradePlanSchema.parse(req.body);
      await this.downgradePlanUseCase.execute({
        userId: req.user.id,
        planCode: body.planCode,
      });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

