import { Request, Response, NextFunction } from 'express';
import { RegisterUserUseCase } from '@application/use-cases/RegisterUserUseCase';
import { LoginUserUseCase } from '@application/use-cases/LoginUserUseCase';
import { RefreshTokenUseCase } from '@application/use-cases/RefreshTokenUseCase';
import { LogoutUseCase } from '@application/use-cases/LogoutUseCase';
import { ForgotPasswordUseCase } from '@application/use-cases/ForgotPasswordUseCase';
import { ResetPasswordUseCase } from '@application/use-cases/ResetPasswordUseCase';
import { SendVerificationEmailUseCase } from '@application/use-cases/SendVerificationEmailUseCase';
import { VerifyEmailUseCase } from '@application/use-cases/VerifyEmailUseCase';
import { AuthenticatedRequest } from '@interface/http/middlewares/requireAuth';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  logoutSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from '@interface/http/schemas/authSchemas';

export class AuthController {
  constructor(
    private registerUserUseCase: RegisterUserUseCase,
    private loginUserUseCase: LoginUserUseCase,
    private refreshTokenUseCase: RefreshTokenUseCase,
    private logoutUseCase: LogoutUseCase,
    private forgotPasswordUseCase: ForgotPasswordUseCase,
    private resetPasswordUseCase: ResetPasswordUseCase,
    private sendVerificationEmailUseCase: SendVerificationEmailUseCase,
    private verifyEmailUseCase: VerifyEmailUseCase
  ) {}

  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = registerSchema.parse(req.body);
      const result = await this.registerUserUseCase.execute(body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = loginSchema.parse(req.body);
      const userAgent = req.headers['user-agent'];
      const ipAddress = req.ip || req.socket.remoteAddress;
      const result = await this.loginUserUseCase.execute({
        ...body,
        userAgent,
        ipAddress,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = refreshTokenSchema.parse(req.body);
      const result = await this.refreshTokenUseCase.execute(body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = logoutSchema.parse(req.body);
      await this.logoutUseCase.execute(body);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = forgotPasswordSchema.parse(req.body);
      await this.forgotPasswordUseCase.execute(body);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = resetPasswordSchema.parse(req.body);
      await this.resetPasswordUseCase.execute(body);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async sendVerificationEmail(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      await this.sendVerificationEmailUseCase.execute({ userId: req.user.id });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = verifyEmailSchema.parse(req.body);
      await this.verifyEmailUseCase.execute(body);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

