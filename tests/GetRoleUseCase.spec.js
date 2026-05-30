import { describe, it, expect, vi } from 'vitest'
import GetRoleUseCase from '@/modules/admin/roles/domain/use-cases/GetRoleUseCase'

describe('GetRoleUseCase', () => {
  it('delega al repositorio con el id recibido', async () => {
    const role = { id: 2, name: 'Viewer', permissions: ['read'] }
    const getByIdMock = vi.fn().mockResolvedValue(role)
    const repo = { getById: getByIdMock }
    const useCase = new GetRoleUseCase(repo)

    const result = await useCase.execute(2)

    expect(getByIdMock).toHaveBeenCalledWith(2)
    expect(result).toEqual(role)
  })

  it('propaga el error si el repositorio falla', async () => {
    const repo = { getById: vi.fn().mockRejectedValue(new Error('No encontrado')) }
    const useCase = new GetRoleUseCase(repo)

    await expect(useCase.execute(99)).rejects.toThrow('No encontrado')
  })
})
