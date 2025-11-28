export type BillingCycle = 'NONE' | 'MONTHLY' | 'YEARLY';

export interface SubscriptionPlan {
  id: string;
  code: string;
  name: string;
  description: string;
  priceCents: number;
  currency: string;
  billingCycle: BillingCycle;
  createdAt: Date;
}

