import express, { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import { config } from '@infrastructure/config/env';
import { swaggerSpec } from '@interface/http/swagger/swagger';
import { PostgresUserRepository } from '@infrastructure/repositories/PostgresUserRepository';
import { PostgresRefreshTokenRepository } from '@infrastructure/repositories/PostgresRefreshTokenRepository';
import { PostgresSubscriptionPlanRepository } from '@infrastructure/repositories/PostgresSubscriptionPlanRepository';
import { PostgresPasswordResetTokenRepository } from '@infrastructure/repositories/PostgresPasswordResetTokenRepository';
import { PostgresEmailVerificationTokenRepository } from '@infrastructure/repositories/PostgresEmailVerificationTokenRepository';
import { BcryptPasswordHasher } from '@infrastructure/security/BcryptPasswordHasher';
import { JwtTokenService } from '@infrastructure/security/JwtTokenService';
import { ConsoleEmailSender } from '@infrastructure/mail/ConsoleEmailSender';
import { RegisterUserUseCase } from '@application/use-cases/RegisterUserUseCase';
import { LoginUserUseCase } from '@application/use-cases/LoginUserUseCase';
import { RefreshTokenUseCase } from '@application/use-cases/RefreshTokenUseCase';
import { LogoutUseCase } from '@application/use-cases/LogoutUseCase';
import { ForgotPasswordUseCase } from '@application/use-cases/ForgotPasswordUseCase';
import { ResetPasswordUseCase } from '@application/use-cases/ResetPasswordUseCase';
import { SendVerificationEmailUseCase } from '@application/use-cases/SendVerificationEmailUseCase';
import { VerifyEmailUseCase } from '@application/use-cases/VerifyEmailUseCase';
import { GetCurrentUserUseCase } from '@application/use-cases/GetCurrentUserUseCase';
import { UpgradePlanUseCase } from '@application/use-cases/UpgradePlanUseCase';
import { DowngradePlanUseCase } from '@application/use-cases/DowngradePlanUseCase';
import { AuthController } from '@interface/http/controllers/AuthController';
import { UserController } from '@interface/http/controllers/UserController';
import { createAuthRoutes } from '@interface/http/routes/authRoutes';
import { createUserRoutes } from '@interface/http/routes/userRoutes';
import { errorHandler } from '@interface/http/middlewares/errorHandler';

function createApp(): Express {
  const app = express();

  app.set('trust proxy', true);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Swagger documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  const userRepository = new PostgresUserRepository();
  const refreshTokenRepository = new PostgresRefreshTokenRepository();
  const subscriptionPlanRepository = new PostgresSubscriptionPlanRepository();
  const passwordResetTokenRepository = new PostgresPasswordResetTokenRepository();
  const emailVerificationTokenRepository = new PostgresEmailVerificationTokenRepository();
  const passwordHasher = new BcryptPasswordHasher();
  const tokenService = new JwtTokenService();
  const emailSender = new ConsoleEmailSender();

  const registerUserUseCase = new RegisterUserUseCase(
    userRepository,
    emailVerificationTokenRepository,
    passwordHasher,
    emailSender
  );
  const loginUserUseCase = new LoginUserUseCase(
    userRepository,
    refreshTokenRepository,
    passwordHasher,
    tokenService
  );
  const refreshTokenUseCase = new RefreshTokenUseCase(
    userRepository,
    refreshTokenRepository,
    tokenService
  );
  const logoutUseCase = new LogoutUseCase(refreshTokenRepository);
  const forgotPasswordUseCase = new ForgotPasswordUseCase(
    userRepository,
    passwordResetTokenRepository,
    emailSender
  );
  const resetPasswordUseCase = new ResetPasswordUseCase(
    userRepository,
    passwordResetTokenRepository,
    refreshTokenRepository,
    passwordHasher
  );
  const sendVerificationEmailUseCase = new SendVerificationEmailUseCase(
    userRepository,
    emailVerificationTokenRepository,
    emailSender
  );
  const verifyEmailUseCase = new VerifyEmailUseCase(
    userRepository,
    emailVerificationTokenRepository
  );
  const getCurrentUserUseCase = new GetCurrentUserUseCase(userRepository);
  const upgradePlanUseCase = new UpgradePlanUseCase(
    userRepository,
    subscriptionPlanRepository
  );
  const downgradePlanUseCase = new DowngradePlanUseCase(
    userRepository,
    subscriptionPlanRepository
  );

  const authController = new AuthController(
    registerUserUseCase,
    loginUserUseCase,
    refreshTokenUseCase,
    logoutUseCase,
    forgotPasswordUseCase,
    resetPasswordUseCase,
    sendVerificationEmailUseCase,
    verifyEmailUseCase
  );
  const userController = new UserController(
    getCurrentUserUseCase,
    upgradePlanUseCase,
    downgradePlanUseCase
  );

  app.use('/auth', createAuthRoutes(authController));
  app.use('/', createUserRoutes(userController));

  app.use(errorHandler);

  return app;
}

const app = createApp();

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = config.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
});

export default app;

