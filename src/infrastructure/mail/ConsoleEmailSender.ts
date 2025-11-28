import { EmailSender } from '@infrastructure/mail/EmailSender';

export class ConsoleEmailSender implements EmailSender {
  async sendVerificationEmail(to: string, token: string): Promise<void> {
    console.log(`[EMAIL] Verification email to ${to}`);
    console.log(`[EMAIL] Token: ${token}`);
    console.log(`[EMAIL] Link: http://localhost:3000/auth/verify-email?token=${token}`);
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    console.log(`[EMAIL] Password reset email to ${to}`);
    console.log(`[EMAIL] Token: ${token}`);
    console.log(`[EMAIL] Link: http://localhost:3000/auth/reset-password?token=${token}`);
  }
}

