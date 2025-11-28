import { v4 as uuidv4 } from 'uuid';
import { UserRepository } from '@domain/repositories/UserRepository';
import { PasswordResetTokenRepository } from '@domain/repositories/PasswordResetTokenRepository';
import { EmailSender } from '@infrastructure/mail/EmailSender';
import { ForgotPasswordInput } from '@application/dto/AuthDTOs';

export class ForgotPasswordUseCase {
  constructor(
    private userRepository: UserRepository,
    private passwordResetTokenRepository: PasswordResetTokenRepository,
    private emailSender: EmailSender
  ) {}

  async execute(input: ForgotPasswordInput): Promise<void> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      return;
    }

    const resetToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await this.passwordResetTokenRepository.create({
      userId: user.id,
      token: resetToken,
      expiresAt,
    });

    await this.emailSender.sendPasswordResetEmail(user.email, resetToken);
  }
}

