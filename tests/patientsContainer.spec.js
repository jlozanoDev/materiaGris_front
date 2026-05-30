import { describe, it, expect, vi } from 'vitest'
import {
  provideSearchPatientsUseCase,
  provideCreatePatientUseCase,
  provideUpdatePatientUseCase,
} from '@/modules/patients/application/containers/patientsContainer'

vi.mock('@/modules/patients/infrastructure/ApiPatientRepository', () => ({
  default: vi.fn(() => ({})),
}))

describe('patientsContainer', () => {
  it('provideSearchPatientsUseCase retorna instancia', () => {
    const useCase = provideSearchPatientsUseCase()
    expect(useCase).toBeDefined()
  })

  it('provideCreatePatientUseCase retorna instancia', () => {
    const useCase = provideCreatePatientUseCase()
    expect(useCase).toBeDefined()
  })

  it('provideUpdatePatientUseCase retorna instancia', () => {
    const useCase = provideUpdatePatientUseCase()
    expect(useCase).toBeDefined()
  })
})
