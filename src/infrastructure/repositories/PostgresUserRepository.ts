import { UserRepository } from '@domain/repositories/UserRepository';
import { User } from '@domain/entities/User';
import { query } from '@infrastructure/db/postgresClient';

export class PostgresUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const result = await query<User>(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    if (result.rows.length === 0) return null;
    return this.mapRowToUser(result.rows[0]);
  }

  async findById(id: string): Promise<User | null> {
    const result = await query<User>(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) return null;
    return this.mapRowToUser(result.rows[0]);
  }

  async create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const result = await query<User>(
      `INSERT INTO users (email, password_hash, role, plan, plan_expires_at, is_email_verified)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        user.email,
        user.passwordHash,
        user.role,
        user.plan,
        user.planExpiresAt || null,
        user.isEmailVerified,
      ]
    );
    return this.mapRowToUser(result.rows[0]);
  }

  async update(id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramCount = 1;

    if (updates.email !== undefined) {
      fields.push(`email = $${paramCount++}`);
      values.push(updates.email);
    }
    if (updates.passwordHash !== undefined) {
      fields.push(`password_hash = $${paramCount++}`);
      values.push(updates.passwordHash);
    }
    if (updates.role !== undefined) {
      fields.push(`role = $${paramCount++}`);
      values.push(updates.role);
    }
    if (updates.plan !== undefined) {
      fields.push(`plan = $${paramCount++}`);
      values.push(updates.plan);
    }
    if (updates.planExpiresAt !== undefined) {
      fields.push(`plan_expires_at = $${paramCount++}`);
      values.push(updates.planExpiresAt || null);
    }
    if (updates.isEmailVerified !== undefined) {
      fields.push(`is_email_verified = $${paramCount++}`);
      values.push(updates.isEmailVerified);
    }

    fields.push(`updated_at = now()`);
    values.push(id);

    const result = await query<User>(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return this.mapRowToUser(result.rows[0]);
  }

  private mapRowToUser(row: unknown): User {
    const r = row as Record<string, unknown>;
    return {
      id: r.id as string,
      email: r.email as string,
      passwordHash: r.password_hash as string,
      role: r.role as User['role'],
      plan: r.plan as string,
      planExpiresAt: r.plan_expires_at ? new Date(r.plan_expires_at as string) : undefined,
      isEmailVerified: r.is_email_verified as boolean,
      createdAt: new Date(r.created_at as string),
      updatedAt: new Date(r.updated_at as string),
    };
  }
}

