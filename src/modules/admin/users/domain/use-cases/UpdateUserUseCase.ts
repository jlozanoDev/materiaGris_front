import type { UserRepository } from "@/modules/admin/users/domain/repositories/UserRepository";

export default class UpdateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: number | string, payload: Record<string, unknown>): Promise<any> {
    return this.userRepository.update(id, payload);
  }
}
