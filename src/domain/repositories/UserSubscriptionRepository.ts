import { UserSubscription } from '@domain/entities/UserSubscription';

export interface UserSubscriptionRepository {
  getActiveForUser(userId: string): Promise<UserSubscription | null>;
  create(subscription: Omit<UserSubscription, 'id' | 'createdAt'>): Promise<UserSubscription>;
  updateStatus(id: string, status: UserSubscription['status'], canceledAt?: Date): Promise<UserSubscription>;
}

