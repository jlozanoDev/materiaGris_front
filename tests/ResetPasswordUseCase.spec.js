import { describe, it, expect, vi } from 'vitest'
import ResetPasswordUseCase from '@/modules/auth/domain/use-cases/ResetPasswordUseCase'

describe('ResetPasswordUseCase', () => {
  it('delega al repositorio con los parámetros correctos', async () => {
    const resetMock = vi.fn().mockResolvedValue({ message: 'ok' })
    const repo = { reset: resetMock }
    const useCase = new ResetPasswordUseCase(repo)

    await useCase.execute('user@test.com', 'token-abc', 'Password123', 'Password123')

    expect(resetMock).toHaveBeenCalledWith('user@test.com', 'token-abc', 'Password123', 'Password123')
  })

  it('propaga el error si el repositorio falla', async () => {
    const repo = { reset: vi.fn().mockRejectedValue({ status: 422, body: { message: 'Token expirado' } }) }
    const useCase = new ResetPasswordUseCase(repo)

    await expect(
      useCase.execute('user@test.com', 'bad-token', 'Password123', 'Password123')
    ).rejects.toMatchObject({ status: 422 })
  })
})
