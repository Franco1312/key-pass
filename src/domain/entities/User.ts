export type UserRole = 'USER' | 'ADMIN';

export type SubscriptionPlan = 'FREE' | 'PREMIUM' | string;

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  plan: SubscriptionPlan;
  planExpiresAt?: Date;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

