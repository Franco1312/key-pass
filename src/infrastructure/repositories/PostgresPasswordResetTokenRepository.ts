import { PasswordResetTokenRepository } from '@domain/repositories/PasswordResetTokenRepository';
import { PasswordResetToken } from '@domain/entities/PasswordResetToken';
import { query } from '@infrastructure/db/postgresClient';

export class PostgresPasswordResetTokenRepository implements PasswordResetTokenRepository {
  async create(token: Omit<PasswordResetToken, 'id' | 'createdAt'>): Promise<PasswordResetToken> {
    const result = await query<PasswordResetToken>(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [token.userId, token.token, token.expiresAt]
    );
    return this.mapRowToToken(result.rows[0]);
  }

  async findByToken(token: string): Promise<PasswordResetToken | null> {
    const result = await query<PasswordResetToken>(
      'SELECT * FROM password_reset_tokens WHERE token = $1',
      [token]
    );
    if (result.rows.length === 0) return null;
    return this.mapRowToToken(result.rows[0]);
  }

  async markAsUsed(token: string): Promise<void> {
    await query(
      'UPDATE password_reset_tokens SET used_at = now() WHERE token = $1',
      [token]
    );
  }

  async deleteExpired(): Promise<void> {
    await query(
      'DELETE FROM password_reset_tokens WHERE expires_at < now()',
      []
    );
  }

  private mapRowToToken(row: unknown): PasswordResetToken {
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

