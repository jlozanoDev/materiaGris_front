import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useRoles } from '@/modules/admin/roles/presentation/composables/useRoles'

vi.mock('@/modules/admin/roles/application/containers/rolesContainer', () => {
  return {
    provideGetRolesUseCase: vi.fn(),
    provideGetRoleUseCase: vi.fn(),
    provideCreateRoleUseCase: vi.fn(),
    provideUpdateRoleUseCase: vi.fn(),
    provideDeleteRoleUseCase: vi.fn(),
  }
})

const {
  provideGetRolesUseCase,
  provideGetRoleUseCase,
  provideCreateRoleUseCase,
  provideUpdateRoleUseCase,
  provideDeleteRoleUseCase,
} = await import('@/modules/admin/roles/application/containers/rolesContainer')

function mockUseCase(provider, executeResult) {
  const mock = { execute: vi.fn() }
  if (executeResult instanceof Error) {
    mock.execute.mockRejectedValue(executeResult)
  } else {
    mock.execute.mockResolvedValue(executeResult)
  }
  provider.mockReturnValue(mock)
  return mock
}

describe('useRoles', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchRoles', () => {
    it('fetches roles and updates state', async () => {
      const fakeRoles = [{ id: 1, name: 'Admin' }]
      mockUseCase(provideGetRolesUseCase, fakeRoles)

      const { fetchRoles, roles, loading, error } = useRoles()

      const result = await fetchRoles()

      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
      expect(roles.value).toEqual(fakeRoles)
      expect(result).toEqual(fakeRoles)
    })

    it('sets error and clears roles on failure', async () => {
      const err = new Error('Network Error')
      mockUseCase(provideGetRolesUseCase, err)

      const { fetchRoles, roles, loading, error } = useRoles()

      roles.value = [{ id: 99, name: 'Old' }]

      const result = await fetchRoles()

      expect(loading.value).toBe(false)
      expect(error.value).toBe(err)
      expect(roles.value).toEqual([])
      expect(result).toBeNull()
    })
  })

  describe('fetchRole', () => {
    it('fetches single role by id', async () => {
      const fakeRole = { id: 5, name: 'Editor' }
      mockUseCase(provideGetRoleUseCase, fakeRole)

      const { fetchRole, loading } = useRoles()

      const result = await fetchRole(5)

      expect(loading.value).toBe(false)
      expect(result).toEqual(fakeRole)
    })

    it('throws on error and sets loading to false', async () => {
      const err = new Error('Not found')
      mockUseCase(provideGetRoleUseCase, err)

      const { fetchRole, loading } = useRoles()

      await expect(fetchRole(99)).rejects.toThrow('Not found')

      expect(loading.value).toBe(false)
    })
  })

  describe('createRole', () => {
    it('creates role then refreshes list', async () => {
      const created = { id: 3, name: 'Guest' }
      const list = [{ id: 1 }, { id: 2 }, { id: 3 }]

      mockUseCase(provideCreateRoleUseCase, created)
      mockUseCase(provideGetRolesUseCase, list)

      const { createRole, roles, loading } = useRoles()

      const result = await createRole({ name: 'Guest' })

      expect(loading.value).toBe(false)
      expect(result).toEqual(created)
      expect(roles.value).toEqual(list)
    })

    it('throws on error and sets loading to false', async () => {
      const err = new Error('Duplicate')
      mockUseCase(provideCreateRoleUseCase, err)

      const { createRole, loading } = useRoles()

      await expect(createRole({ name: 'Dup' })).rejects.toThrow('Duplicate')

      expect(loading.value).toBe(false)
    })
  })

  describe('updateRole', () => {
    it('updates role then refreshes list', async () => {
      const updated = { id: 2, name: 'Editor Updated' }
      const list = [{ id: 1 }, { id: 2 }]

      mockUseCase(provideUpdateRoleUseCase, updated)
      mockUseCase(provideGetRolesUseCase, list)

      const { updateRole, roles, loading } = useRoles()

      const result = await updateRole(2, { name: 'Editor Updated' })

      expect(loading.value).toBe(false)
      expect(result).toEqual(updated)
      expect(roles.value).toEqual(list)
    })

    it('throws on error and sets loading to false', async () => {
      const err = new Error('Not found')
      mockUseCase(provideUpdateRoleUseCase, err)

      const { updateRole, loading } = useRoles()

      await expect(updateRole(99, {})).rejects.toThrow('Not found')

      expect(loading.value).toBe(false)
    })
  })

  describe('deleteRole', () => {
    it('deletes role then refreshes list', async () => {
      const deleteRes = { ok: true }
      const list = [{ id: 1 }]

      mockUseCase(provideDeleteRoleUseCase, deleteRes)
      mockUseCase(provideGetRolesUseCase, list)

      const { deleteRole, roles, loading } = useRoles()

      const result = await deleteRole(2)

      expect(loading.value).toBe(false)
      expect(result).toEqual(deleteRes)
      expect(roles.value).toEqual(list)
    })

    it('throws on error and sets loading to false', async () => {
      const err = new Error('Forbidden')
      mockUseCase(provideDeleteRoleUseCase, err)

      const { deleteRole, loading } = useRoles()

      await expect(deleteRole(1)).rejects.toThrow('Forbidden')

      expect(loading.value).toBe(false)
    })
  })

  describe('fetchAvailablePermissions', () => {
    it('returns empty array when no fetchPermissionsFn is provided', async () => {
      const { fetchAvailablePermissions, availablePermissions } = useRoles()

      const result = await fetchAvailablePermissions()

      expect(result).toEqual([])
      expect(availablePermissions.value).toEqual([])
    })

    it('fetches permissions and updates state when fn is provided', async () => {
      const perms = [{ id: 1, name: 'users.create' }]
      const fetchFn = vi.fn().mockResolvedValue(perms)

      const { fetchAvailablePermissions, availablePermissions } = useRoles(fetchFn)

      const result = await fetchAvailablePermissions()

      expect(fetchFn).toHaveBeenCalled()
      expect(result).toEqual(perms)
      expect(availablePermissions.value).toEqual(perms)
    })

    it('returns empty array on fetch error when fn is provided', async () => {
      const fetchFn = vi.fn().mockRejectedValue(new Error('Forbidden'))

      const { fetchAvailablePermissions, availablePermissions } = useRoles(fetchFn)

      const result = await fetchAvailablePermissions()

      expect(result).toEqual([])
      expect(availablePermissions.value).toEqual([])
    })
  })
})
