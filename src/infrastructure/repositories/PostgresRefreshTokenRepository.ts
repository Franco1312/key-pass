import { RefreshTokenRepository } from '@domain/repositories/RefreshTokenRepository';
import { RefreshToken } from '@domain/entities/RefreshToken';
import { query } from '@infrastructure/db/postgresClient';

export class PostgresRefreshTokenRepository implements RefreshTokenRepository {
  async create(token: Omit<RefreshToken, 'id' | 'createdAt'>): Promise<RefreshToken> {
    const result = await query<RefreshToken>(
      `INSERT INTO refresh_tokens (user_id, token, user_agent, ip_address, is_revoked, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        token.userId,
        token.token,
        token.userAgent || null,
        token.ipAddress || null,
        token.isRevoked,
        token.expiresAt,
      ]
    );
    return this.mapRowToToken(result.rows[0]);
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    const result = await query<RefreshToken>(
      'SELECT * FROM refresh_tokens WHERE token = $1',
      [token]
    );
    if (result.rows.length === 0) return null;
    return this.mapRowToToken(result.rows[0]);
  }

  async revoke(token: string): Promise<void> {
    await query(
      'UPDATE refresh_tokens SET is_revoked = TRUE WHERE token = $1',
      [token]
    );
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await query(
      'UPDATE refresh_tokens SET is_revoked = TRUE WHERE user_id = $1',
      [userId]
    );
  }

  async deleteExpired(): Promise<void> {
    await query(
      'DELETE FROM refresh_tokens WHERE expires_at < now()',
      []
    );
  }

  private mapRowToToken(row: unknown): RefreshToken {
    const r = row as Record<string, unknown>;
    return {
      id: r.id as string,
      userId: r.user_id as string,
      token: r.token as string,
      userAgent: r.user_agent as string | undefined,
      ipAddress: r.ip_address as string | undefined,
      isRevoked: r.is_revoked as boolean,
      expiresAt: new Date(r.expires_at as string),
      createdAt: new Date(r.created_at as string),
    };
  }
}

