import ApiUserRepository from '@/modules/auth/infrastructure/ApiUserRepository'
import ForgotPasswordUseCase from '@/modules/auth/domain/use-cases/ForgotPasswordUseCase'

export function provideForgotUseCase() {
  const userRepo = new ApiUserRepository()
  return new ForgotPasswordUseCase(userRepo)
}

export default { provideForgotUseCase }
