import { vi, describe, it, expect, beforeEach } from 'vitest'
import { usePermissions } from '@/modules/admin/permissions/presentation/composables/usePermissions'

const mockExecute = vi.fn()

vi.mock(
  '@/modules/admin/permissions/application/containers/permissionsContainer',
  () => ({
    provideGetAllPermissionsUseCase: vi.fn(() => ({ execute: mockExecute })),
  }),
)

describe('usePermissions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('starts with empty permissions, loading false, error null', () => {
      const { permissions, loading, error } = usePermissions()

      expect(permissions.value).toEqual([])
      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
    })
  })

  describe('fetchPermissions', () => {
    it('sets loading true, fetches, assigns data, returns it', async () => {
      const fakePermissions = [
        { id: 1, name: 'users.read' },
        { id: 2, name: 'users.write' },
      ]
      mockExecute.mockResolvedValue(fakePermissions)

      const { permissions, loading, error, fetchPermissions } = usePermissions()
      const promise = fetchPermissions()

      expect(loading.value).toBe(true)
      expect(error.value).toBeNull()

      const result = await promise

      expect(result).toEqual(fakePermissions)
      expect(permissions.value).toEqual(fakePermissions)
      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
    })

    it('on error sets error, clears permissions, returns null, finishes loading', async () => {
      const fakeError = new Error('Permission denied')
      mockExecute.mockRejectedValue(fakeError)

      const { permissions, loading, error, fetchPermissions } = usePermissions()
      const result = await fetchPermissions()

      expect(result).toBeNull()
      expect(error.value).toBe(fakeError)
      expect(permissions.value).toEqual([])
      expect(loading.value).toBe(false)
    })
  })
})
