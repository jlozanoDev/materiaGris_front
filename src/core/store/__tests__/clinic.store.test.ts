import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

describe('useClinicStore — updateLogo', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('updateLogo sets clinic.logo to the given URL', async () => {
    const { useClinicStore } = await import('../clinic')
    const store = useClinicStore()

    // Simulate clinic data loaded from API
    store.clinic = {
      id: 1,
      nombre: 'Test',
      direccion: 'Calle 123',
      telefono: '123',
      email: 'a@b.com',
      ciudad: 'City',
      provincia: 'Prov',
      codigo_postal: '0000',
    }

    // Production code: updateLogo should mutate clinic.logo
    store.updateLogo('https://example.com/storage/logos/1_abc.png')

    expect(store.clinic?.logo).toBe('https://example.com/storage/logos/1_abc.png')
  })

  it('updateLogo does nothing when clinic is null', async () => {
    const { useClinicStore } = await import('../clinic')
    const store = useClinicStore()

    store.clinic = null

    // Production code: should not throw when clinic is null
    expect(() => store.updateLogo('https://example.com/logo.png')).not.toThrow()
    expect(store.clinic).toBeNull()
  })
})
