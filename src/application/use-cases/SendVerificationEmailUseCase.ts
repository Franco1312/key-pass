import { v4 as uuidv4 } from 'uuid';
import { UserRepository } from '@domain/repositories/UserRepository';
import { EmailVerificationTokenRepository } from '@domain/repositories/EmailVerificationTokenRepository';
import { EmailSender } from '@infrastructure/mail/EmailSender';
import { SendVerificationEmailInput } from '@application/dto/AuthDTOs';

export class SendVerificationEmailUseCase {
  constructor(
    private userRepository: UserRepository,
    private emailVerificationTokenRepository: EmailVerificationTokenRepository,
    private emailSender: EmailSender
  ) {}

  async execute(input: SendVerificationEmailInput): Promise<void> {
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.isEmailVerified) {
      return;
    }

    const verificationToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await this.emailVerificationTokenRepository.create({
      userId: user.id,
      token: verificationToken,
      expiresAt,
    });

    await this.emailSender.sendVerificationEmail(user.email, verificationToken);
  }
}

