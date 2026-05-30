import { describe, it, expect, vi } from 'vitest'
import UpdateRoleUseCase from '@/modules/admin/roles/domain/use-cases/UpdateRoleUseCase'

describe('UpdateRoleUseCase', () => {
  it('delega al repositorio con id y payload recibidos', async () => {
    const updated = { id: 3, name: 'Admin', permissions: ['all'] }
    const updateMock = vi.fn().mockResolvedValue(updated)
    const repo = { update: updateMock }
    const useCase = new UpdateRoleUseCase(repo)

    const payload = { name: 'Admin', permissions: ['all'] }
    const result = await useCase.execute(3, payload)

    expect(updateMock).toHaveBeenCalledWith(3, payload)
    expect(result).toEqual(updated)
  })

  it('propaga el error si el repositorio falla', async () => {
    const repo = { update: vi.fn().mockRejectedValue({ status: 422 }) }
    const useCase = new UpdateRoleUseCase(repo)

    await expect(useCase.execute(1, { name: '' })).rejects.toMatchObject({ status: 422 })
  })
})
