import { describe, it, expect, vi } from 'vitest'
import LoginUseCase from '@/modules/auth/domain/use-cases/LoginUseCase'

describe('LoginUseCase', () => {
  it('delega al repositorio con las credenciales recibidas', async () => {
    const tokenData = { access_token: 'abc123', token_type: 'bearer' }
    const loginMock = vi.fn().mockResolvedValue(tokenData)
    const repo = { login: loginMock }
    const useCase = new LoginUseCase(repo)

    const credentials = { email: 'user@example.com', password: 'secret123' }
    const result = await useCase.execute(credentials)

    expect(loginMock).toHaveBeenCalledWith(credentials)
    expect(result).toEqual(tokenData)
  })

  it('propaga el error si el repositorio falla', async () => {
    const repo = { login: vi.fn().mockRejectedValue({ status: 401, body: { message: 'Credenciales inválidas' } }) }
    const useCase = new LoginUseCase(repo)

    await expect(useCase.execute({ email: 'bad@example.com', password: 'wrong' })).rejects.toMatchObject({ status: 401 })
  })
})
