import { PasswordResetToken } from '@domain/entities/PasswordResetToken';

export interface PasswordResetTokenRepository {
  create(token: Omit<PasswordResetToken, 'id' | 'createdAt'>): Promise<PasswordResetToken>;
  findByToken(token: string): Promise<PasswordResetToken | null>;
  markAsUsed(token: string): Promise<void>;
  deleteExpired(): Promise<void>;
}

