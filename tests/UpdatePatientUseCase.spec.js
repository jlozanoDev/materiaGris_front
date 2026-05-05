import { describe, it, expect, vi } from 'vitest'
import UpdatePatientUseCase from '@/modules/patients/domain/use-cases/UpdatePatientUseCase'

describe('UpdatePatientUseCase', () => {
  it('delegates to repository with id and payload', async () => {
    const updated = { id: 42, first_name: 'Luis' }
    const updateMock = vi.fn().mockResolvedValue(updated)
    const repo = { update: updateMock }
    const useCase = new UpdatePatientUseCase(repo)

    const payload = { first_name: 'Luis' }
    const result = await useCase.execute(42, payload)

    expect(updateMock).toHaveBeenCalledWith(42, payload)
    expect(result).toEqual(updated)
  })

  it('propaga el error si el repositorio falla', async () => {
    const repo = { update: vi.fn().mockRejectedValue({ status: 422, body: { message: 'Error' } }) }
    const useCase = new UpdatePatientUseCase(repo)

    await expect(useCase.execute(1, { first_name: 'X' })).rejects.toMatchObject({ status: 422 })
  })
})
