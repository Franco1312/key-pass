import { UserRepository } from '@domain/repositories/UserRepository';
import { SubscriptionPlanRepository } from '@domain/repositories/SubscriptionPlanRepository';
import { UpgradePlanInput } from '@application/dto/AuthDTOs';

export class UpgradePlanUseCase {
  constructor(
    private userRepository: UserRepository,
    private subscriptionPlanRepository: SubscriptionPlanRepository
  ) {}

  async execute(input: UpgradePlanInput): Promise<void> {
    const plan = await this.subscriptionPlanRepository.findByCode(input.planCode);
    if (!plan) {
      throw new Error('Plan not found');
    }

    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new Error('User not found');
    }

    const planExpiresAt = new Date();
    if (plan.billingCycle === 'MONTHLY') {
      planExpiresAt.setMonth(planExpiresAt.getMonth() + 1);
    } else if (plan.billingCycle === 'YEARLY') {
      planExpiresAt.setFullYear(planExpiresAt.getFullYear() + 1);
    }

    await this.userRepository.update(input.userId, {
      plan: plan.code,
      planExpiresAt: plan.billingCycle !== 'NONE' ? planExpiresAt : undefined,
    });
  }
}

