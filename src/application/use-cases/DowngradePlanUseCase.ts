import { UserRepository } from '@domain/repositories/UserRepository';
import { SubscriptionPlanRepository } from '@domain/repositories/SubscriptionPlanRepository';
import { DowngradePlanInput } from '@application/dto/AuthDTOs';

export class DowngradePlanUseCase {
  constructor(
    private userRepository: UserRepository,
    private subscriptionPlanRepository: SubscriptionPlanRepository
  ) {}

  async execute(input: DowngradePlanInput): Promise<void> {
    const plan = await this.subscriptionPlanRepository.findByCode(input.planCode);
    if (!plan) {
      throw new Error('Plan not found');
    }

    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new Error('User not found');
    }

    await this.userRepository.update(input.userId, {
      plan: plan.code,
      planExpiresAt: undefined,
    });
  }
}

