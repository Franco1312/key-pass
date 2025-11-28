import { SubscriptionPlan } from '@domain/entities/SubscriptionPlan';

export interface SubscriptionPlanRepository {
  findByCode(code: string): Promise<SubscriptionPlan | null>;
  findById(id: string): Promise<SubscriptionPlan | null>;
  listAll(): Promise<SubscriptionPlan[]>;
}

