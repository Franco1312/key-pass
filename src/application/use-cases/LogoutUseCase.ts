import { RefreshTokenRepository } from '@domain/repositories/RefreshTokenRepository';
import { LogoutInput } from '@application/dto/AuthDTOs';

export class LogoutUseCase {
  constructor(private refreshTokenRepository: RefreshTokenRepository) {}

  async execute(input: LogoutInput): Promise<void> {
    if (input.revokeAll) {
      const refreshToken = await this.refreshTokenRepository.findByToken(input.refreshToken);
      if (refreshToken) {
        await this.refreshTokenRepository.revokeAllForUser(refreshToken.userId);
      }
    } else {
      await this.refreshTokenRepository.revoke(input.refreshToken);
    }
  }
}

