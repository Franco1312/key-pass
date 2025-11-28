import { Router, Request, Response, NextFunction } from 'express';
import { AuthController } from '@interface/http/controllers/AuthController';
import { requireAuth } from '@interface/http/middlewares/requireAuth';

export function createAuthRoutes(authController: AuthController): Router {
  const router = Router();

  /**
   * @swagger
   * /auth/register:
   *   post:
   *     tags: [Authentication]
   *     summary: Register a new user
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/RegisterRequest'
   *     responses:
   *       201:
   *         description: User registered successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/RegisterResponse'
   *       409:
   *         description: Email already in use
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
  router.post('/register', (req: Request, res: Response, next: NextFunction) => authController.register(req, res, next));

  /**
   * @swagger
   * /auth/login:
   *   post:
   *     tags: [Authentication]
   *     summary: Login with email and password
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/LoginRequest'
   *     responses:
   *       200:
   *         description: Login successful
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/LoginResponse'
   *       401:
   *         description: Invalid credentials
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
  router.post('/login', (req, res, next) => authController.login(req, res, next));

  /**
   * @swagger
   * /auth/refresh:
   *   post:
   *     tags: [Authentication]
   *     summary: Refresh access token
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/RefreshTokenRequest'
   *     responses:
   *       200:
   *         description: Token refreshed successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/RefreshTokenResponse'
   *       400:
   *         description: Invalid or expired refresh token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.post('/refresh', (req, res, next) => authController.refresh(req, res, next));

  /**
   * @swagger
   * /auth/logout:
   *   post:
   *     tags: [Authentication]
   *     summary: Logout and revoke refresh token
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/LogoutRequest'
   *     responses:
   *       204:
   *         description: Logout successful
   *       400:
   *         description: Validation error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.post('/logout', (req, res, next) => authController.logout(req, res, next));

  /**
   * @swagger
   * /auth/forgot-password:
   *   post:
   *     tags: [Authentication]
   *     summary: Request password reset
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/ForgotPasswordRequest'
   *     responses:
   *       204:
   *         description: Password reset email sent (if email exists)
   *       400:
   *         description: Validation error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.post('/forgot-password', (req, res, next) => authController.forgotPassword(req, res, next));

  /**
   * @swagger
   * /auth/reset-password:
   *   post:
   *     tags: [Authentication]
   *     summary: Reset password with token
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/ResetPasswordRequest'
   *     responses:
   *       204:
   *         description: Password reset successful
   *       400:
   *         description: Invalid or expired token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.post('/reset-password', (req, res, next) => authController.resetPassword(req, res, next));

  /**
   * @swagger
   * /auth/send-verification-email:
   *   post:
   *     tags: [Authentication]
   *     summary: Send email verification
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       204:
   *         description: Verification email sent
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.post('/send-verification-email', requireAuth, (req, res, next) =>
    authController.sendVerificationEmail(req, res, next)
  );

  /**
   * @swagger
   * /auth/verify-email:
   *   post:
   *     tags: [Authentication]
   *     summary: Verify email with token
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/VerifyEmailRequest'
   *     responses:
   *       204:
   *         description: Email verified successfully
   *       400:
   *         description: Invalid or expired token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.post('/verify-email', (req, res, next) => authController.verifyEmail(req, res, next));

  return router;
}
