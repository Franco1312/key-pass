import { Router, Request, Response, NextFunction } from 'express';
import { UserController } from '@interface/http/controllers/UserController';
import { requireAuth } from '@interface/http/middlewares/requireAuth';

export function createUserRoutes(userController: UserController): Router {
  const router = Router();

  /**
   * @swagger
   * /me:
   *   get:
   *     tags: [User]
   *     summary: Get current user information
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: User information
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UserResponse'
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       404:
   *         description: User not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.get('/me', requireAuth, (req: Request, res: Response, next: NextFunction) => userController.getCurrentUser(req, res, next));

  /**
   * @swagger
   * /me/upgrade-plan:
   *   post:
   *     tags: [User]
   *     summary: Upgrade subscription plan
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpgradePlanRequest'
   *     responses:
   *       204:
   *         description: Plan upgraded successfully
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       404:
   *         description: Plan not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       400:
   *         description: Validation error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.post('/me/upgrade-plan', requireAuth, (req, res, next) =>
    userController.upgradePlan(req, res, next)
  );

  /**
   * @swagger
   * /me/downgrade-plan:
   *   post:
   *     tags: [User]
   *     summary: Downgrade subscription plan
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/DowngradePlanRequest'
   *     responses:
   *       204:
   *         description: Plan downgraded successfully
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       404:
   *         description: Plan not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       400:
   *         description: Validation error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.post('/me/downgrade-plan', requireAuth, (req, res, next) =>
    userController.downgradePlan(req, res, next)
  );

  return router;
}
