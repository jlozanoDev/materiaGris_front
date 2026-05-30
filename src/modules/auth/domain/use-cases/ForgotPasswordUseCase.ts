import type { UserRepository } from "@/modules/auth/domain/repositories/UserRepository";

export default class ForgotPasswordUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(email: string): Promise<any> {
    return this.userRepository.forgot(email);
  }
}
