import { describe, it, expect, vi } from 'vitest'
import CreateRoleUseCase from '@/modules/admin/roles/domain/use-cases/CreateRoleUseCase'

describe('CreateRoleUseCase', () => {
  it('delega al repositorio con el payload recibido', async () => {
    const created = { id: 1, name: 'Editor', permissions: ['read', 'write'] }
    const createMock = vi.fn().mockResolvedValue(created)
    const repo = { create: createMock }
    const useCase = new CreateRoleUseCase(repo)

    const payload = { name: 'Editor', permissions: ['read', 'write'] }
    const result = await useCase.execute(payload)

    expect(createMock).toHaveBeenCalledWith(payload)
    expect(result).toEqual(created)
  })

  it('propaga el error si el repositorio falla', async () => {
    const repo = { create: vi.fn().mockRejectedValue(new Error('Fallo')) }
    const useCase = new CreateRoleUseCase(repo)

    await expect(useCase.execute({ name: 'Bad' })).rejects.toThrow('Fallo')
  })
})
