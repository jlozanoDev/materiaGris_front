import type { UserRepository } from "@/modules/admin/users/domain/repositories/UserRepository";

export default class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(payload: Record<string, unknown>): Promise<any> {
    return this.userRepository.create(payload);
  }
}
