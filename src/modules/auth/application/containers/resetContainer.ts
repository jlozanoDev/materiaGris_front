import ApiUserRepository from "@/modules/auth/infrastructure/ApiUserRepository";
import ResetPasswordUseCase from "@/modules/auth/domain/use-cases/ResetPasswordUseCase";

export function provideResetPasswordUseCase(): ResetPasswordUseCase {
  return new ResetPasswordUseCase(new ApiUserRepository());
}
