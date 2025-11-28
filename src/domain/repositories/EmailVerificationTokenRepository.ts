import { EmailVerificationToken } from '@domain/entities/EmailVerificationToken';

export interface EmailVerificationTokenRepository {
  create(token: Omit<EmailVerificationToken, 'id' | 'createdAt'>): Promise<EmailVerificationToken>;
  findByToken(token: string): Promise<EmailVerificationToken | null>;
  markAsUsed(token: string): Promise<void>;
  deleteExpired(): Promise<void>;
}

