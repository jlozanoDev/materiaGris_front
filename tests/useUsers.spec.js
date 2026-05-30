import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useUsers } from '@/modules/admin/users/presentation/composables/useUsers'

vi.mock('@/modules/admin/users/application/containers/usersContainer', () => {
  return {
    provideGetAllUsersUseCase: vi.fn(),
    provideCreateUserUseCase: vi.fn(),
    provideUpdateUserUseCase: vi.fn(),
    provideDeleteUserUseCase: vi.fn(),
  }
})

const {
  provideGetAllUsersUseCase,
  provideCreateUserUseCase,
  provideUpdateUserUseCase,
  provideDeleteUserUseCase,
} = await import('@/modules/admin/users/application/containers/usersContainer')

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

describe('useUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchUsers', () => {
    it('fetches users successfully and updates reactive state', async () => {
      const fakeUsers = [{ id: 1, name: 'Alice', email: 'alice@example.com' }]
      mockUseCase(provideGetAllUsersUseCase, fakeUsers)

      const { fetchUsers, users, loading, error } = useUsers()

      const result = await fetchUsers()

      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
      expect(users.value).toEqual(fakeUsers)
      expect(result).toEqual(fakeUsers)
    })

    it('sets error and resets users on failure', async () => {
      const err = new Error('Network Error')
      mockUseCase(provideGetAllUsersUseCase, err)

      const { fetchUsers, users, loading, error } = useUsers()

      // Set users to something first to validate reset
      users.value = [{ id: 9, name: 'Old' }]

      const result = await fetchUsers()

      expect(loading.value).toBe(false)
      expect(error.value).toBe(err)
      expect(users.value).toEqual([])
      expect(result).toBeNull()
    })

    it('sets loading to false in finally even on error', async () => {
      const err = new Error('Boom')
      mockUseCase(provideGetAllUsersUseCase, err)

      const { fetchUsers, loading } = useUsers()

      await fetchUsers()

      expect(loading.value).toBe(false)
    })
  })

  describe('createUser', () => {
    it('creates user then refreshes the list', async () => {
      const createdUser = { id: 2, name: 'Bob' }
      const fakeList = [{ id: 1 }, { id: 2 }]

      mockUseCase(provideCreateUserUseCase, createdUser)
      mockUseCase(provideGetAllUsersUseCase, fakeList)

      const { createUser, users, loading } = useUsers()

      const result = await createUser({ name: 'Bob', email: 'bob@example.com' })

      expect(loading.value).toBe(false)
      expect(result).toEqual(createdUser)
      expect(users.value).toEqual(fakeList)
    })

    it('throws and sets loading to false on error', async () => {
      const err = new Error('Create failed')
      mockUseCase(provideCreateUserUseCase, err)

      const { createUser, loading } = useUsers()

      await expect(createUser({ name: 'Fail' })).rejects.toThrow('Create failed')

      expect(loading.value).toBe(false)
    })
  })

  describe('updateUser', () => {
    it('updates user then refreshes the list', async () => {
      const updatedUser = { id: 1, name: 'Alice Updated' }
      const fakeList = [{ id: 1, name: 'Alice Updated' }]

      mockUseCase(provideUpdateUserUseCase, updatedUser)
      mockUseCase(provideGetAllUsersUseCase, fakeList)

      const { updateUser, users, loading } = useUsers()

      const result = await updateUser(1, { name: 'Alice Updated' })

      expect(loading.value).toBe(false)
      expect(result).toEqual(updatedUser)
      expect(users.value).toEqual(fakeList)
    })

    it('throws and sets loading to false on error', async () => {
      const err = new Error('Update failed')
      mockUseCase(provideUpdateUserUseCase, err)

      const { updateUser, loading } = useUsers()

      await expect(updateUser(1, { name: 'Fail' })).rejects.toThrow('Update failed')

      expect(loading.value).toBe(false)
    })
  })

  describe('deleteUser', () => {
    it('deletes user then refreshes the list', async () => {
      const deleteRes = { success: true }
      const fakeList = [{ id: 2 }]

      mockUseCase(provideDeleteUserUseCase, deleteRes)
      mockUseCase(provideGetAllUsersUseCase, fakeList)

      const { deleteUser, users, loading } = useUsers()

      const result = await deleteUser(1)

      expect(loading.value).toBe(false)
      expect(result).toEqual(deleteRes)
      expect(users.value).toEqual(fakeList)
    })

    it('throws and sets loading to false on error', async () => {
      const err = new Error('Delete failed')
      mockUseCase(provideDeleteUserUseCase, err)

      const { deleteUser, loading } = useUsers()

      await expect(deleteUser(1)).rejects.toThrow('Delete failed')

      expect(loading.value).toBe(false)
    })
  })
})
