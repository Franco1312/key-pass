import { UserRepository } from '@domain/repositories/UserRepository';
import { PasswordResetTokenRepository } from '@domain/repositories/PasswordResetTokenRepository';
import { RefreshTokenRepository } from '@domain/repositories/RefreshTokenRepository';
import { PasswordHasher } from '@infrastructure/security/PasswordHasher';
import { ResetPasswordInput } from '@application/dto/AuthDTOs';

export class ResetPasswordUseCase {
  constructor(
    private userRepository: UserRepository,
    private passwordResetTokenRepository: PasswordResetTokenRepository,
    private refreshTokenRepository: RefreshTokenRepository,
    private passwordHasher: PasswordHasher
  ) {}

  async execute(input: ResetPasswordInput): Promise<void> {
    const resetToken = await this.passwordResetTokenRepository.findByToken(input.token);
    if (!resetToken) {
      throw new Error('Invalid reset token');
    }

    if (resetToken.usedAt) {
      throw new Error('Reset token has already been used');
    }

    if (resetToken.expiresAt < new Date()) {
      throw new Error('Reset token has expired');
    }

    const user = await this.userRepository.findById(resetToken.userId);
    if (!user) {
      throw new Error('User not found');
    }

    const newPasswordHash = await this.passwordHasher.hash(input.newPassword);
    await this.userRepository.update(user.id, { passwordHash: newPasswordHash });

    await this.passwordResetTokenRepository.markAsUsed(input.token);
    await this.refreshTokenRepository.revokeAllForUser(user.id);
  }
}

