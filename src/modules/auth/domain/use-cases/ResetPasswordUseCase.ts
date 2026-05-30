import type { UserRepository } from "@/modules/auth/domain/repositories/UserRepository";

export default class ResetPasswordUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(
    email: string,
    token: string,
    password: string,
    passwordConfirmation: string,
  ): Promise<any> {
    // NOTE: calls repository.reset with 4 args, but UserRepository.reset expects a single object.
    // The infrastructure adapter bridges this mismatch.
    return this.userRepository.reset({ token, password, password_confirmation: passwordConfirmation });
  }
}
