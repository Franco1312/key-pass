import { v4 as uuidv4 } from 'uuid';
import { UserRepository } from '@domain/repositories/UserRepository';
import { RefreshTokenRepository } from '@domain/repositories/RefreshTokenRepository';
import { PasswordHasher } from '@infrastructure/security/PasswordHasher';
import { TokenService } from '@infrastructure/security/TokenService';
import { LoginUserInput, LoginUserOutput } from '@application/dto/AuthDTOs';
import { config } from '@infrastructure/config/env';

export class LoginUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private refreshTokenRepository: RefreshTokenRepository,
    private passwordHasher: PasswordHasher,
    private tokenService: TokenService
  ) {}

  async execute(input: LoginUserInput): Promise<LoginUserOutput> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await this.passwordHasher.compare(
      input.password,
      user.passwordHash
    );
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    const accessToken = this.tokenService.signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      plan: user.plan,
    });

    const refreshTokenValue = uuidv4();
    const expiresAt = new Date();
    const expiresInDays = parseInt(config.JWT_REFRESH_TOKEN_EXPIRES_IN.replace('d', '')) || 30;
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    await this.refreshTokenRepository.create({
      userId: user.id,
      token: refreshTokenValue,
      userAgent: input.userAgent,
      ipAddress: input.ipAddress,
      isRevoked: false,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken: refreshTokenValue,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        plan: user.plan,
      },
    };
  }
}

