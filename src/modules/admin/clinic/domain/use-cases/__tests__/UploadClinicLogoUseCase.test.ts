import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ClinicRepository } from '@/modules/admin/clinic/domain/repositories/ClinicRepository'
import type { Clinic } from '@/shared/types'

const mockClinic: Clinic = {
  id: 1,
  nombre: 'Test Clinic',
  direccion: 'Calle 123',
  telefono: '123456789',
  email: 'test@clinica.com',
  ciudad: 'Buenos Aires',
  provincia: 'CABA',
  codigo_postal: 'C1000',
  logo: 'https://example.com/storage/logos/1_new.png',
}

function createMockRepo(): ClinicRepository {
  return {
    get: vi.fn(),
    update: vi.fn(),
    uploadLogo: vi.fn().mockResolvedValue(mockClinic),
  }
}

describe('UploadClinicLogoUseCase', () => {
  let UploadClinicLogoUseCase: typeof import('../UploadClinicLogoUseCase').default

  beforeEach(async () => {
    vi.clearAllMocks()
    const mod = await import('../UploadClinicLogoUseCase')
    UploadClinicLogoUseCase = mod.default
  })

  // --- Happy path ---

  it('accepts PNG file and delegates to repository', async () => {
    const repo = createMockRepo()
    const useCase = new UploadClinicLogoUseCase(repo)
    const file = new File(['fake-png'], 'logo.png', { type: 'image/png' })

    const result = await useCase.execute(file)

    expect(result.logo).toBe(mockClinic.logo)
    expect(repo.uploadLogo).toHaveBeenCalledWith(file)
  })

  it('accepts JPG file', async () => {
    const repo = createMockRepo()
    const useCase = new UploadClinicLogoUseCase(repo)
    const file = new File(['fake-jpg'], 'logo.jpg', { type: 'image/jpeg' })

    const result = await useCase.execute(file)

    expect(result.logo).toBe(mockClinic.logo)
    expect(repo.uploadLogo).toHaveBeenCalledWith(file)
  })

  it('accepts SVG file', async () => {
    const repo = createMockRepo()
    const useCase = new UploadClinicLogoUseCase(repo)
    const file = new File(['fake-svg'], 'logo.svg', { type: 'image/svg+xml' })

    const result = await useCase.execute(file)

    expect(result.logo).toBe(mockClinic.logo)
    expect(repo.uploadLogo).toHaveBeenCalledWith(file)
  })

  it('accepts WebP file', async () => {
    const repo = createMockRepo()
    const useCase = new UploadClinicLogoUseCase(repo)
    const file = new File(['fake-webp'], 'logo.webp', { type: 'image/webp' })

    const result = await useCase.execute(file)

    expect(result.logo).toBe(mockClinic.logo)
    expect(repo.uploadLogo).toHaveBeenCalledWith(file)
  })

  // --- Validation errors ---

  it('rejects file with unsupported MIME type', async () => {
    const repo = createMockRepo()
    const useCase = new UploadClinicLogoUseCase(repo)
    const file = new File(['fake-gif'], 'logo.gif', { type: 'image/gif' })

    await expect(useCase.execute(file)).rejects.toThrow(
      'Tipo de archivo no válido'
    )
    expect(repo.uploadLogo).not.toHaveBeenCalled()
  })

  it('rejects file larger than 5MB', async () => {
    const repo = createMockRepo()
    const useCase = new UploadClinicLogoUseCase(repo)
    // 5MB + 1 byte
    const oversized = new ArrayBuffer(5 * 1024 * 1024 + 1)
    const file = new File([oversized], 'large.png', { type: 'image/png' })

    await expect(useCase.execute(file)).rejects.toThrow(
      'El archivo excede el tamaño máximo'
    )
    expect(repo.uploadLogo).not.toHaveBeenCalled()
  })

  it('accepts file exactly at 5MB boundary', async () => {
    const repo = createMockRepo()
    const useCase = new UploadClinicLogoUseCase(repo)
    const exactly5MB = new ArrayBuffer(5 * 1024 * 1024)
    const file = new File([exactly5MB], 'boundary.png', { type: 'image/png' })

    const result = await useCase.execute(file)

    expect(result.logo).toBe(mockClinic.logo)
    expect(repo.uploadLogo).toHaveBeenCalledWith(file)
  })

  // --- Error propagation ---

  it('propagates repository-level errors', async () => {
    const repo = createMockRepo()
    repo.uploadLogo = vi.fn().mockRejectedValue({
      status: 422,
      body: { message: 'Logo already exists' },
    })
    const useCase = new UploadClinicLogoUseCase(repo)
    const file = new File(['fake'], 'logo.png', { type: 'image/png' })

    await expect(useCase.execute(file)).rejects.toEqual({
      status: 422,
      body: { message: 'Logo already exists' },
    })
  })

  it('propagates network errors', async () => {
    const repo = createMockRepo()
    repo.uploadLogo = vi.fn().mockRejectedValue(new Error('Error de conexión'))
    const useCase = new UploadClinicLogoUseCase(repo)
    const file = new File(['fake'], 'logo.png', { type: 'image/png' })

    await expect(useCase.execute(file)).rejects.toThrow('Error de conexión')
  })
})
