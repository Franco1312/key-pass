import { EmailVerificationTokenRepository } from '@domain/repositories/EmailVerificationTokenRepository';
import { EmailVerificationToken } from '@domain/entities/EmailVerificationToken';
import { query } from '@infrastructure/db/postgresClient';

export class PostgresEmailVerificationTokenRepository implements EmailVerificationTokenRepository {
  async create(token: Omit<EmailVerificationToken, 'id' | 'createdAt'>): Promise<EmailVerificationToken> {
    const result = await query<EmailVerificationToken>(
      `INSERT INTO email_verification_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [token.userId, token.token, token.expiresAt]
    );
    return this.mapRowToToken(result.rows[0]);
  }

  async findByToken(token: string): Promise<EmailVerificationToken | null> {
    const result = await query<EmailVerificationToken>(
      'SELECT * FROM email_verification_tokens WHERE token = $1',
      [token]
    );
    if (result.rows.length === 0) return null;
    return this.mapRowToToken(result.rows[0]);
  }

  async markAsUsed(token: string): Promise<void> {
    await query(
      'UPDATE email_verification_tokens SET used_at = now() WHERE token = $1',
      [token]
    );
  }

  async deleteExpired(): Promise<void> {
    await query(
      'DELETE FROM email_verification_tokens WHERE expires_at < now()',
      []
    );
  }

  private mapRowToToken(row: unknown): EmailVerificationToken {
    const r = row as Record<string, unknown>;
    return {
      id: r.id as string,
      userId: r.user_id as string,
      token: r.token as string,
      expiresAt: new Date(r.expires_at as string),
      usedAt: r.used_at ? new Date(r.used_at as string) : undefined,
      createdAt: new Date(r.created_at as string),
    };
  }
}

