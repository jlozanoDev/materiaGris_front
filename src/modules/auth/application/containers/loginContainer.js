import ApiUserRepository from '@/modules/auth/infrastructure/ApiUserRepository'
import LoginUseCase from '@/modules/auth/domain/use-cases/LoginUseCase'

export function provideLoginUseCase() {
  const userRepo = new ApiUserRepository()
  return new LoginUseCase(userRepo)
}

export default { provideLoginUseCase }
