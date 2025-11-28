import { UserSubscriptionRepository } from '@domain/repositories/UserSubscriptionRepository';
import { UserSubscription } from '@domain/entities/UserSubscription';
import { query } from '@infrastructure/db/postgresClient';

export class PostgresUserSubscriptionRepository implements UserSubscriptionRepository {
  async getActiveForUser(userId: string): Promise<UserSubscription | null> {
    const result = await query<UserSubscription>(
      `SELECT * FROM user_subscriptions 
       WHERE user_id = $1 AND status = 'ACTIVE' 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [userId]
    );
    if (result.rows.length === 0) return null;
    return this.mapRowToSubscription(result.rows[0]);
  }

  async create(subscription: Omit<UserSubscription, 'id' | 'createdAt'>): Promise<UserSubscription> {
    const result = await query<UserSubscription>(
      `INSERT INTO user_subscriptions 
       (user_id, plan_id, status, started_at, current_period_start, current_period_end, canceled_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        subscription.userId,
        subscription.planId,
        subscription.status,
        subscription.startedAt,
        subscription.currentPeriodStart,
        subscription.currentPeriodEnd,
        subscription.canceledAt || null,
      ]
    );
    return this.mapRowToSubscription(result.rows[0]);
  }

  async updateStatus(id: string, status: UserSubscription['status'], canceledAt?: Date): Promise<UserSubscription> {
    const result = await query<UserSubscription>(
      `UPDATE user_subscriptions 
       SET status = $1, canceled_at = $2 
       WHERE id = $3 
       RETURNING *`,
      [status, canceledAt || null, id]
    );
    return this.mapRowToSubscription(result.rows[0]);
  }

  private mapRowToSubscription(row: unknown): UserSubscription {
    const r = row as Record<string, unknown>;
    return {
      id: r.id as string,
      userId: r.user_id as string,
      planId: r.plan_id as string,
      status: r.status as UserSubscription['status'],
      startedAt: new Date(r.started_at as string),
      currentPeriodStart: new Date(r.current_period_start as string),
      currentPeriodEnd: new Date(r.current_period_end as string),
      canceledAt: r.canceled_at ? new Date(r.canceled_at as string) : undefined,
      createdAt: new Date(r.created_at as string),
    };
  }
}

