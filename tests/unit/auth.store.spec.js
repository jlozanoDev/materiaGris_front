import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/core/store/auth'
import { setStorageGateway } from '@/core/services/serviceRegistry'

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    setStorageGateway({
      get: () => null,
      set: () => {},
      remove: () => {},
    })
  })

  it('hasPermission/hasPermissions work when user is set directly', () => {
    const store = useAuthStore()

    store.user = {
      id: 1,
      roles: ['admin'],
      permissions: { 'admin.user.view': 1, 'admin.role.view': 1 },
      permissions_version: '2026-01-01T00:00:00.000Z',
    }

    expect(store.hasPermission('admin.user.view')).toBe(true)
    expect(store.hasPermission('nonexistent')).toBe(false)
    expect(store.hasPermissions(['admin.user.view', 'unknown'], 'any')).toBe(true)
    expect(store.hasPermissions(['admin.user.view', 'unknown'], 'all')).toBe(false)
    expect(store.hasPermissions(['admin.user.view', 'admin.role.view'], 'all')).toBe(true)
  })

  it('clearUser resets state', () => {
    const store = useAuthStore()
    store.user = { id: 1, roles: ['admin'], permissions: { 'admin.user.view': 1 } }
    store.clearUser()
    expect(store.user).toBeNull()
    expect(store.hasPermission('admin.user.view')).toBe(false)
  })
})
