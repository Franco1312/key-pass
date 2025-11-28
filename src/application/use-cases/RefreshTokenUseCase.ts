import { v4 as uuidv4 } from 'uuid';
import { UserRepository } from '@domain/repositories/UserRepository';
import { RefreshTokenRepository } from '@domain/repositories/RefreshTokenRepository';
import { TokenService } from '@infrastructure/security/TokenService';
import { RefreshTokenInput, RefreshTokenOutput } from '@application/dto/AuthDTOs';
import { config } from '@infrastructure/config/env';

export class RefreshTokenUseCase {
  constructor(
    private userRepository: UserRepository,
    private refreshTokenRepository: RefreshTokenRepository,
    private tokenService: TokenService
  ) {}

  async execute(input: RefreshTokenInput): Promise<RefreshTokenOutput> {
    const refreshToken = await this.refreshTokenRepository.findByToken(input.refreshToken);
    if (!refreshToken) {
      throw new Error('Invalid refresh token');
    }

    if (refreshToken.isRevoked) {
      throw new Error('Refresh token has been revoked');
    }

    if (refreshToken.expiresAt < new Date()) {
      throw new Error('Refresh token has expired');
    }

    const user = await this.userRepository.findById(refreshToken.userId);
    if (!user) {
      throw new Error('User not found');
    }

    const accessToken = this.tokenService.signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      plan: user.plan,
    });

    await this.refreshTokenRepository.revoke(input.refreshToken);

    const newRefreshTokenValue = uuidv4();
    const expiresAt = new Date();
    const expiresInDays = parseInt(config.JWT_REFRESH_TOKEN_EXPIRES_IN.replace('d', '')) || 30;
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    await this.refreshTokenRepository.create({
      userId: user.id,
      token: newRefreshTokenValue,
      userAgent: refreshToken.userAgent,
      ipAddress: refreshToken.ipAddress,
      isRevoked: false,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken: newRefreshTokenValue,
    };
  }
}

