import ApiUserRepository from "@/modules/auth/infrastructure/ApiUserRepository";
import ForgotPasswordUseCase from "@/modules/auth/domain/use-cases/ForgotPasswordUseCase";

export function provideForgotUseCase(): ForgotPasswordUseCase {
  const userRepo = new ApiUserRepository();
  return new ForgotPasswordUseCase(userRepo);
}
