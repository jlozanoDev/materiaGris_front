import type { UserRepository } from "@/modules/admin/users/domain/repositories/UserRepository";

export default class GetAllUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(): Promise<any> {
    return this.userRepository.all();
  }
}
