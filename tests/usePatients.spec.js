import { vi, describe, it, expect, beforeEach } from 'vitest'
import { usePatients } from '@/modules/patients/presentation/composables/usePatients'

const mockSearchExecute = vi.fn()
const mockCreateExecute = vi.fn()
const mockUpdateExecute = vi.fn()

vi.mock('@/modules/patients/application/containers/patientsContainer', () => ({
  provideSearchPatientsUseCase: vi.fn(() => ({ execute: mockSearchExecute })),
  provideCreatePatientUseCase: vi.fn(() => ({ execute: mockCreateExecute })),
  provideUpdatePatientUseCase: vi.fn(() => ({ execute: mockUpdateExecute })),
}))

describe('usePatients', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchPatients', () => {
    it('sets loading true, calls search use case, returns patients', async () => {
      const fakePatients = [
        { id: 1, first_name: 'Ana', last_name: 'García' },
        { id: 2, first_name: 'Luis', last_name: 'Pérez' },
      ]
      mockSearchExecute.mockResolvedValue(fakePatients)

      const { patients, loading, error, fetchPatients } = usePatients()

      const filters = { q: 'Ana' }
      const promise = fetchPatients(filters)

      expect(loading.value).toBe(true)
      expect(error.value).toBeNull()

      await promise

      expect(patients.value).toEqual(fakePatients)
      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
    })

    it('uses empty filters by default', async () => {
      mockSearchExecute.mockResolvedValue([])

      const { fetchPatients } = usePatients()
      await fetchPatients()

      expect(mockSearchExecute).toHaveBeenCalledWith({})
    })

    it('sets error when search fails and finally clears loading', async () => {
      const fakeError = new Error('Network failure')
      mockSearchExecute.mockRejectedValue(fakeError)

      const { loading, error, fetchPatients } = usePatients()
      await fetchPatients()

      expect(error.value).toBe(fakeError)
      expect(loading.value).toBe(false)
    })
  })

  describe('createPatient', () => {
    it('calls create use case with payload and returns its result', async () => {
      const created = { id: 3, first_name: 'Nuevo' }
      mockCreateExecute.mockResolvedValue(created)

      const { createPatient } = usePatients()
      const payload = { first_name: 'Nuevo', last_name: 'Usuario' }
      const result = await createPatient(payload)

      expect(mockCreateExecute).toHaveBeenCalledWith(payload)
      expect(result).toEqual(created)
    })
  })

  describe('updatePatient', () => {
    it('calls update use case with id and payload and returns its result', async () => {
      const updated = { id: 1, first_name: 'Ana María' }
      mockUpdateExecute.mockResolvedValue(updated)

      const { updatePatient } = usePatients()
      const result = await updatePatient(1, { first_name: 'Ana María' })

      expect(mockUpdateExecute).toHaveBeenCalledWith(1, { first_name: 'Ana María' })
      expect(result).toEqual(updated)
    })

    it('works with string id', async () => {
      mockUpdateExecute.mockResolvedValue({ id: 'abc', first_name: 'X' })

      const { updatePatient } = usePatients()
      await updatePatient('abc', { first_name: 'X' })

      expect(mockUpdateExecute).toHaveBeenCalledWith('abc', { first_name: 'X' })
    })
  })

  describe('initial state', () => {
    it('starts with empty patients, loading false, error null', () => {
      const { patients, loading, error } = usePatients()

      expect(patients.value).toEqual([])
      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
    })
  })
})
