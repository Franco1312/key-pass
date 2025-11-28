import { UserRepository } from '@domain/repositories/UserRepository';
import { EmailVerificationTokenRepository } from '@domain/repositories/EmailVerificationTokenRepository';
import { VerifyEmailInput } from '@application/dto/AuthDTOs';

export class VerifyEmailUseCase {
  constructor(
    private userRepository: UserRepository,
    private emailVerificationTokenRepository: EmailVerificationTokenRepository
  ) {}

  async execute(input: VerifyEmailInput): Promise<void> {
    const verificationToken = await this.emailVerificationTokenRepository.findByToken(input.token);
    if (!verificationToken) {
      throw new Error('Invalid verification token');
    }

    if (verificationToken.usedAt) {
      throw new Error('Verification token has already been used');
    }

    if (verificationToken.expiresAt < new Date()) {
      throw new Error('Verification token has expired');
    }

    const user = await this.userRepository.findById(verificationToken.userId);
    if (!user) {
      throw new Error('User not found');
    }

    await this.userRepository.update(user.id, { isEmailVerified: true });
    await this.emailVerificationTokenRepository.markAsUsed(input.token);
  }
}

