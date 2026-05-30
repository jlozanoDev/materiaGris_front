import type { UserRepository } from "@/modules/auth/domain/repositories/UserRepository";

export default class LoginUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(credentials: { email: string; password: string }): Promise<any> {
    return this.userRepository.login(credentials);
  }
}
