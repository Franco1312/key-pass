import { SubscriptionPlanRepository } from '@domain/repositories/SubscriptionPlanRepository';
import { SubscriptionPlan } from '@domain/entities/SubscriptionPlan';
import { query } from '@infrastructure/db/postgresClient';

export class PostgresSubscriptionPlanRepository implements SubscriptionPlanRepository {
  async findByCode(code: string): Promise<SubscriptionPlan | null> {
    const result = await query<SubscriptionPlan>(
      'SELECT * FROM subscription_plans WHERE code = $1',
      [code]
    );
    if (result.rows.length === 0) return null;
    return this.mapRowToPlan(result.rows[0]);
  }

  async findById(id: string): Promise<SubscriptionPlan | null> {
    const result = await query<SubscriptionPlan>(
      'SELECT * FROM subscription_plans WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) return null;
    return this.mapRowToPlan(result.rows[0]);
  }

  async listAll(): Promise<SubscriptionPlan[]> {
    const result = await query<SubscriptionPlan>('SELECT * FROM subscription_plans ORDER BY price_cents');
    return result.rows.map(row => this.mapRowToPlan(row));
  }

  private mapRowToPlan(row: unknown): SubscriptionPlan {
    const r = row as Record<string, unknown>;
    return {
      id: r.id as string,
      code: r.code as string,
      name: r.name as string,
      description: r.description as string,
      priceCents: r.price_cents as number,
      currency: r.currency as string,
      billingCycle: r.billing_cycle as SubscriptionPlan['billingCycle'],
      createdAt: new Date(r.created_at as string),
    };
  }
}

