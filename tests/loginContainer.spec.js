import { describe, it, expect, vi } from 'vitest'
import { provideLoginUseCase } from '@/modules/auth/application/containers/loginContainer'

vi.mock('@/modules/auth/infrastructure/ApiUserRepository', () => ({
  default: vi.fn(() => ({})),
}))

describe('loginContainer', () => {
  it('provideLoginUseCase retorna una instancia de LoginUseCase', () => {
    const useCase = provideLoginUseCase()
    expect(useCase).toBeDefined()
  })
})
