import { UserRepository } from '@domain/repositories/UserRepository';
import { GetCurrentUserOutput } from '@application/dto/AuthDTOs';

export class GetCurrentUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(userId: string): Promise<GetCurrentUserOutput> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      plan: user.plan,
      planExpiresAt: user.planExpiresAt,
      isEmailVerified: user.isEmailVerified,
    };
  }
}

