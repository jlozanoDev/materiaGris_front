import { describe, it, expect, vi } from 'vitest'
import SearchPatientsUseCase from '@/modules/patients/domain/use-cases/SearchPatientsUseCase'

describe('SearchPatientsUseCase', () => {
  it('delega al repositorio con los filtros recibidos', async () => {
    const patients = [{ id: 1, first_name: 'Ana' }]
    const searchMock = vi.fn().mockResolvedValue(patients)
    const repo = { search: searchMock }
    const useCase = new SearchPatientsUseCase(repo)

    const filters = { q: 'Ana', city: 'Madrid' }
    const result = await useCase.execute(filters)

    expect(searchMock).toHaveBeenCalledWith(filters)
    expect(result).toEqual(patients)
  })

  it('llama sin filtros si no se pasan', async () => {
    const searchMock = vi.fn().mockResolvedValue([])
    const repo = { search: searchMock }
    const useCase = new SearchPatientsUseCase(repo)

    await useCase.execute()

    expect(searchMock).toHaveBeenCalledWith({})
  })

  it('propaga el error si el repositorio falla', async () => {
    const repo = { search: vi.fn().mockRejectedValue(new Error('network')) }
    const useCase = new SearchPatientsUseCase(repo)

    await expect(useCase.execute({ q: 'test' })).rejects.toThrow('network')
  })
})
