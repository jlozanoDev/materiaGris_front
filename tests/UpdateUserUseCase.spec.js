import { describe, it, expect, vi } from 'vitest'
import UpdateUserUseCase from '@/modules/admin/users/domain/use-cases/UpdateUserUseCase'

describe('UpdateUserUseCase', () => {
  it('delega al repositorio con id y payload recibidos', async () => {
    const updated = { id: 5, name: 'Updated', email: 'updated@example.com' }
    const updateMock = vi.fn().mockResolvedValue(updated)
    const repo = { update: updateMock }
    const useCase = new UpdateUserUseCase(repo)

    const payload = { name: 'Updated', email: 'updated@example.com' }
    const result = await useCase.execute(5, payload)

    expect(updateMock).toHaveBeenCalledWith(5, payload)
    expect(result).toEqual(updated)
  })

  it('propaga el error si el repositorio falla', async () => {
    const repo = { update: vi.fn().mockRejectedValue({ status: 422, body: { message: 'Datos inválidos' } }) }
    const useCase = new UpdateUserUseCase(repo)

    await expect(useCase.execute(1, { name: '' })).rejects.toMatchObject({ status: 422 })
  })
})
