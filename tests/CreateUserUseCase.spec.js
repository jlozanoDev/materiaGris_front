import { describe, it, expect, vi } from 'vitest'
import CreateUserUseCase from '@/modules/admin/users/domain/use-cases/CreateUserUseCase'

describe('CreateUserUseCase', () => {
  it('delega al repositorio con el payload recibido', async () => {
    const created = { id: 1, name: 'Test User', email: 'test@example.com' }
    const createMock = vi.fn().mockResolvedValue(created)
    const repo = { create: createMock }
    const useCase = new CreateUserUseCase(repo)

    const payload = { name: 'Test User', email: 'test@example.com', role_id: 2 }
    const result = await useCase.execute(payload)

    expect(createMock).toHaveBeenCalledWith(payload)
    expect(result).toEqual(created)
  })

  it('propaga el error si el repositorio falla', async () => {
    const repo = { create: vi.fn().mockRejectedValue(new Error('Fallo de red')) }
    const useCase = new CreateUserUseCase(repo)

    await expect(useCase.execute({ name: 'Test' })).rejects.toThrow('Fallo de red')
  })
})
