import type { UserRepository } from "@/modules/admin/users/domain/repositories/UserRepository";

export default class DeleteUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: number | string): Promise<any> {
    return this.userRepository.delete(id);
  }
}
