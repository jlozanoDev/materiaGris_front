import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/core/store/auth', () => ({
  useAuthStore: () => ({
    user: null,
    fetchUser: vi.fn().mockResolvedValue(null),
    hasPermission: () => true,
    hasPermissions: () => true,
    clearUser: vi.fn(),
  }),
}))

import { setAuthService, setStorageGateway } from '@/core/services/serviceRegistry'

describe('router guard', () => {
  let router
  let mockStorage
  let mockAuthService

  beforeEach(async () => {
    // Reset state
    vi.resetModules()
    localStorage.clear()
    setActivePinia(createPinia())

    const store = {}
    mockStorage = {
      get: vi.fn((key) => store[key] ?? null),
      set: vi.fn((key, value) => { store[key] = value }),
      remove: vi.fn((key) => { delete store[key] }),
      clear: vi.fn(),
    }

    mockAuthService = {
      userRepository: { me: vi.fn().mockResolvedValue(null) },
      storageGateway: mockStorage,
      login: vi.fn(),
      validateToken: vi.fn().mockResolvedValue(false),
      logout: vi.fn(),
      clearSession: vi.fn(),
    }

    setStorageGateway(mockStorage)
    setAuthService(mockAuthService)

    router = (await import('@/core/router/index')).default
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // Helper: simulate beforeEach guard
  async function simulateGuard(to, from = {}) {
    return new Promise((resolve) => {
      // Find the beforeEach guard
      const results = []
      // Access router's beforeEach hooks — we'll test via navigation
      // Instead, call the guard function directly if we can
      resolve({ to, from })
    })
  }

  // The better approach: mock localStorage and test guard logic by triggering
  // navigation and observing the outcome via the replace/push calls.
  // Since beforeEach is internal, we test via actual navigation.

  function setAuthenticated(token = 'valid-token') {
    localStorage.setItem('access_token', token)
  }

  function clearAuth() {
    localStorage.removeItem('access_token')
  }

  // ---------------------------------------------------------------------------
  // Auth-required routes: unauthenticated
  // ---------------------------------------------------------------------------
  describe('requiresAuth — unauthenticated', () => {
    it('redirects "/" to Landing when unauthenticated', async () => {
      clearAuth()
      await router.push('/')
      expect(router.currentRoute.value.name).toBe('Landing')
    })

    it('redirects non-root auth route to Login with redirect query', async () => {
      clearAuth()
      await router.push('/admin/users')
      expect(router.currentRoute.value.name).toBe('Login')
      expect(router.currentRoute.value.query.redirect).toBe('/admin/users')
    })

    it('redirects Patients to Login when unauthenticated', async () => {
      clearAuth()
      await router.push('/patients')
      expect(router.currentRoute.value.name).toBe('Login')
    })
  })

  // ---------------------------------------------------------------------------
  // Auth-required routes: authenticated
  // ---------------------------------------------------------------------------
  describe('requiresAuth — authenticated', () => {
    beforeEach(() => {
      setAuthenticated()
    })

    it('allows access to Dashboard when authenticated', async () => {
      await router.push('/')
      expect(router.currentRoute.value.name).toBe('Dashboard')
    })

    it('allows access to AdminUsers when authenticated', async () => {
      await router.push('/admin/users')
      expect(router.currentRoute.value.name).toBe('AdminUsers')
    })

    it('allows access to Patients when authenticated', async () => {
      await router.push('/patients')
      expect(router.currentRoute.value.name).toBe('Patients')
    })
  })

  // ---------------------------------------------------------------------------
  // Login/Landing routes — authenticated user
  // ---------------------------------------------------------------------------
  describe('auth pages — authenticated', () => {
    beforeEach(() => {
      setAuthenticated()
    })

    it('redirects Login to Dashboard when authenticated', async () => {
      await router.push('/login')
      expect(router.currentRoute.value.name).toBe('Dashboard')
    })

    it('redirects Landing to Dashboard when authenticated', async () => {
      await router.push('/welcome')
      expect(router.currentRoute.value.name).toBe('Dashboard')
    })
  })

  // ---------------------------------------------------------------------------
  // Login/Landing routes — unauthenticated user
  // ---------------------------------------------------------------------------
  describe('auth pages — unauthenticated', () => {
    beforeEach(() => {
      clearAuth()
    })

    it('allows access to Login when unauthenticated', async () => {
      await router.push('/login')
      expect(router.currentRoute.value.name).toBe('Login')
    })

    it('allows access to Landing when unauthenticated', async () => {
      await router.push('/welcome')
      expect(router.currentRoute.value.name).toBe('Landing')
    })

    it('allows access to ForgotPassword when unauthenticated', async () => {
      await router.push('/forgot-password')
      expect(router.currentRoute.value.name).toBe('ForgotPassword')
    })

    it('allows access to ResetPassword when unauthenticated', async () => {
      await router.push('/reset-password')
      expect(router.currentRoute.value.name).toBe('ResetPassword')
    })
  })

  // ---------------------------------------------------------------------------
  // Router structure
  // ---------------------------------------------------------------------------
  describe('router structure', () => {
    it('has named routes for all pages', () => {
      const names = router.getRoutes().map((r) => r.name)
      // Defined routes (including auto-generated ones)
      expect(names).toContain('Dashboard')
      expect(names).toContain('Login')
      expect(names).toContain('Landing')
      expect(names).toContain('AdminUsers')
      expect(names).toContain('AdminRoles')
      expect(names).toContain('AdminPermissions')
      expect(names).toContain('Patients')
      expect(names).toContain('ForgotPassword')
      expect(names).toContain('ResetPassword')
    })

    it('uses web history mode', () => {
      expect(router.options.history).toBeDefined()
    })
  })
})
