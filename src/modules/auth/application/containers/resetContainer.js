import ApiUserRepository from '@/modules/auth/infrastructure/ApiUserRepository'
import ResetPasswordUseCase from '@/modules/auth/domain/use-cases/ResetPasswordUseCase'

export function provideResetPasswordUseCase() {
  return new ResetPasswordUseCase(new ApiUserRepository())
}

export default { provideResetPasswordUseCase }
