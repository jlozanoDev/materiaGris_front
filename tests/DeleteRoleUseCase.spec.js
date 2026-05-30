import { describe, it, expect, vi } from 'vitest'
import DeleteRoleUseCase from '@/modules/admin/roles/domain/use-cases/DeleteRoleUseCase'

describe('DeleteRoleUseCase', () => {
  it('delega al repositorio con el id recibido', async () => {
    const deleteMock = vi.fn().mockResolvedValue({ success: true })
    const repo = { delete: deleteMock }
    const useCase = new DeleteRoleUseCase(repo)

    const result = await useCase.execute(7)

    expect(deleteMock).toHaveBeenCalledWith(7)
    expect(result).toEqual({ success: true })
  })

  it('propaga el error si el repositorio falla', async () => {
    const repo = { delete: vi.fn().mockRejectedValue(new Error('No permitido')) }
    const useCase = new DeleteRoleUseCase(repo)

    await expect(useCase.execute(99)).rejects.toThrow('No permitido')
  })
})
