import { describe, it, expect, vi } from 'vitest'
import DeleteUserUseCase from '@/modules/admin/users/domain/use-cases/DeleteUserUseCase'

describe('DeleteUserUseCase', () => {
  it('delega al repositorio con el id recibido', async () => {
    const deleteMock = vi.fn().mockResolvedValue({ success: true })
    const repo = { delete: deleteMock }
    const useCase = new DeleteUserUseCase(repo)

    const result = await useCase.execute(42)

    expect(deleteMock).toHaveBeenCalledWith(42)
    expect(result).toEqual({ success: true })
  })

  it('propaga el error si el repositorio falla', async () => {
    const repo = { delete: vi.fn().mockRejectedValue(new Error('No encontrado')) }
    const useCase = new DeleteUserUseCase(repo)

    await expect(useCase.execute(99)).rejects.toThrow('No encontrado')
  })
})
