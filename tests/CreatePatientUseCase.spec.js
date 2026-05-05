import { describe, it, expect, vi } from 'vitest'
import CreatePatientUseCase from '@/modules/patients/domain/use-cases/CreatePatientUseCase'

describe('CreatePatientUseCase', () => {
  it('delega al repositorio con el payload recibido', async () => {
    const created = { id: 42, first_name: 'Luis', last_name: 'García' }
    const createMock = vi.fn().mockResolvedValue(created)
    const repo = { create: createMock }
    const useCase = new CreatePatientUseCase(repo)

    const payload = { first_name: 'Luis', last_name: 'García', national_id: '12345678A' }
    const result = await useCase.execute(payload)

    expect(createMock).toHaveBeenCalledWith(payload)
    expect(result).toEqual(created)
  })

  it('propaga el error si el repositorio falla', async () => {
    const repo = { create: vi.fn().mockRejectedValue({ status: 422, body: { message: 'NHC duplicado' } }) }
    const useCase = new CreatePatientUseCase(repo)

    await expect(useCase.execute({ first_name: 'Test' })).rejects.toMatchObject({ status: 422 })
  })
})
