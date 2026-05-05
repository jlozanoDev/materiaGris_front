import ApiUserRepository from '@/modules/auth/infrastructure/ApiUserRepository'
import AuthService from '@/modules/auth/domain/services/AuthService'

export function provideAuthService() {
  const userRepo = new ApiUserRepository()
  return new AuthService(userRepo)
}

export default { provideAuthService }
