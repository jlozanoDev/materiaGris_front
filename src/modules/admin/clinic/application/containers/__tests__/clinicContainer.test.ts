import { describe, it, expect } from 'vitest'
import UploadClinicLogoUseCase from '@/modules/admin/clinic/domain/use-cases/UploadClinicLogoUseCase'

describe('clinicContainer — provideUploadClinicLogoUseCase', () => {
  it('returns an UploadClinicLogoUseCase instance', async () => {
    const { provideUploadClinicLogoUseCase } = await import('../clinicContainer')
    const useCase = provideUploadClinicLogoUseCase()

    // Production code: container provides a properly constructed
    // UploadClinicLogoUseCase wired to ApiClinicRepository
    expect(useCase).toBeInstanceOf(UploadClinicLogoUseCase)
  })
})
