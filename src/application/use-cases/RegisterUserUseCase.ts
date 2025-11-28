import { v4 as uuidv4 } from 'uuid';
import { UserRepository } from '@domain/repositories/UserRepository';
import { EmailVerificationTokenRepository } from '@domain/repositories/EmailVerificationTokenRepository';
import { PasswordHasher } from '@infrastructure/security/PasswordHasher';
import { EmailSender } from '@infrastructure/mail/EmailSender';
import { RegisterUserInput, RegisterUserOutput } from '@application/dto/AuthDTOs';

export class RegisterUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private emailVerificationTokenRepository: EmailVerificationTokenRepository,
    private passwordHasher: PasswordHasher,
    private emailSender: EmailSender
  ) {}

  async execute(input: RegisterUserInput): Promise<RegisterUserOutput> {
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new Error('Email already in use');
    }

    const passwordHash = await this.passwordHasher.hash(input.password);

    const user = await this.userRepository.create({
      email: input.email,
      passwordHash,
      role: 'USER',
      plan: 'FREE',
      isEmailVerified: false,
    });

    const verificationToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await this.emailVerificationTokenRepository.create({
      userId: user.id,
      token: verificationToken,
      expiresAt,
    });

    await this.emailSender.sendVerificationEmail(user.email, verificationToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        plan: user.plan,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }
}

