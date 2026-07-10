import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// Mock fetchClient before importing the store
vi.mock('@/core/api/httpClient', () => ({
  fetchClient: vi.fn(),
}))

let useClinicStore
let fetchClientMock

describe('clinicStore', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    vi.clearAllMocks()

    const httpMock = await import('@/core/api/httpClient')
    fetchClientMock = httpMock.fetchClient

    const mod = await import('@/core/store/clinic')
    useClinicStore = mod.useClinicStore
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('initial state', () => {
    it('clinic starts as null', () => {
      const store = useClinicStore()
      expect(store.clinic).toBeNull()
    })

    it('loading starts as false', () => {
      const store = useClinicStore()
      expect(store.loading).toBe(false)
    })

    it('error starts as null', () => {
      const store = useClinicStore()
      expect(store.error).toBeNull()
    })
  })

  describe('fetchClinic', () => {
    it('fetches clinic data from API and stores it', async () => {
      const clinicData = {
        id: 1,
        nombre: 'Clínica Test',
        direccion: 'Av. Siempre Viva 123',
        telefono: '555-1234',
        email: 'test@clinica.com',
        ciudad: 'Buenos Aires',
        provincia: 'CABA',
        codigo_postal: '1000',
        web: 'https://test.com',
        cuit: '30-12345678-9',
      }
      fetchClientMock.mockResolvedValue(clinicData)

      const store = useClinicStore()
      const result = await store.fetchClinic()

      expect(fetchClientMock).toHaveBeenCalledWith('/admin/clinic', { method: 'GET' })
      expect(result).toEqual(clinicData)
      expect(store.clinic).toEqual(clinicData)
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('sets loading to true during fetch and false after', async () => {
      let resolvePromise
      fetchClientMock.mockReturnValue(new Promise((resolve) => { resolvePromise = resolve }))

      const store = useClinicStore()
      const promise = store.fetchClinic()

      expect(store.loading).toBe(true)

      resolvePromise({ nombre: 'Test' })
      await promise

      expect(store.loading).toBe(false)
    })

    it('sets clinic to null and clears error on 404 (no clinic yet — expected state)', async () => {
      const apiError = { status: 404, body: { message: 'Not found' } }
      fetchClientMock.mockRejectedValue(apiError)

      const store = useClinicStore()
      const result = await store.fetchClinic()

      expect(result).toBeNull()
      expect(store.clinic).toBeNull()
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('sets clinic to null and error on network failure', async () => {
      fetchClientMock.mockRejectedValue(new Error('Network error'))

      const store = useClinicStore()
      const result = await store.fetchClinic()

      expect(result).toBeNull()
      expect(store.clinic).toBeNull()
      expect(store.loading).toBe(false)
      expect(store.error).toBe('Error de conexión')
    })

    it('handles 401 by propagating the error', async () => {
      const apiError = { status: 401, body: { message: 'Unauthorized' } }
      fetchClientMock.mockRejectedValue(apiError)

      const store = useClinicStore()
      await expect(store.fetchClinic()).rejects.toEqual(apiError)
      // 401 is handled by httpClient's unauthorized handler, store propagates it
    })

    it('handles non-404 errors and sets error message', async () => {
      const apiError = { status: 500, body: { message: 'Server error' } }
      fetchClientMock.mockRejectedValue(apiError)

      const store = useClinicStore()
      const result = await store.fetchClinic()

      expect(result).toBeNull()
      expect(store.clinic).toBeNull()
      expect(store.error).toBe('Error al cargar los datos de la clínica')
    })
  })
})
