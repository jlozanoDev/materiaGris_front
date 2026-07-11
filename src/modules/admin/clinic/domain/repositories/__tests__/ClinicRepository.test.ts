import { describe, it, expect, vi } from 'vitest'
import type { ClinicRepository } from '../ClinicRepository'
import type { Clinic } from '@/shared/types'

describe('ClinicRepository interface — uploadLogo', () => {
  it('mock repository can implement uploadLogo', async () => {
    const mockClinic: Clinic = {
      id: 1,
      nombre: 'Test',
      direccion: 'Calle 123',
      telefono: '123',
      email: 'a@b.com',
      ciudad: 'City',
      provincia: 'Prov',
      codigo_postal: '0000',
      logo: 'https://example.com/storage/logos/1_abc.png',
    }

    // Create a mock that implements the extended interface
    const repo: ClinicRepository = {
      get: vi.fn().mockResolvedValue(mockClinic),
      update: vi.fn().mockResolvedValue(mockClinic),
      uploadLogo: vi.fn().mockResolvedValue(mockClinic),
    }

    // Simulate a use case calling uploadLogo
    const file = new File(['fake-image'], 'logo.png', { type: 'image/png' })
    const result = await repo.uploadLogo(file)

    // Production code: repository.uploadLogo receives a File and returns Clinic
    expect(result.logo).toBe('https://example.com/storage/logos/1_abc.png')
    expect(repo.uploadLogo).toHaveBeenCalledWith(file)
  })
})
