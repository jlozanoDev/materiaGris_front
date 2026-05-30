import { describe, it, expect, vi, beforeEach } from 'vitest'
import AuthService from '@/modules/auth/domain/services/AuthService'

function makeStorage(overrides = {}) {
  const store = {}
  return {
    get: vi.fn((key) => store[key] ?? null),
    set: vi.fn((key, value) => { store[key] = value }),
    remove: vi.fn((key) => { delete store[key] }),
    _store: store,
    ...overrides,
  }
}

function makeRepo(overrides = {}) {
  return {
    me: vi.fn(),
    logout: vi.fn(),
    refresh: vi.fn(),
    ...overrides,
  }
}

describe('AuthService', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('validateToken', () => {
    it('devuelve false si no hay token en storage', async () => {
      const storage = makeStorage()
      const repo = makeRepo()
      const service = new AuthService(repo, storage)
      const result = await service.validateToken()
      expect(result).toBe(false)
      expect(repo.me).not.toHaveBeenCalled()
    })

    it('devuelve true y guarda el usuario si el token es válido', async () => {
      const storage = makeStorage()
      storage._store.access_token = 'valid-token'
      const user = { id: 1, name: 'Ana' }
      const repo = makeRepo({ me: vi.fn().mockResolvedValue(user) })
      const service = new AuthService(repo, storage)

      const result = await service.validateToken()

      expect(result).toBe(true)
      expect(storage.set).toHaveBeenCalledWith('user', JSON.stringify(user))
    })

    it('intenta refresh si /me responde 401 y retorna true si el refresh funciona', async () => {
      const storage = makeStorage()
      storage._store.access_token = 'expired-token'
      const user = { id: 1, name: 'Ana' }
      const repo = makeRepo({
        me: vi.fn()
          .mockRejectedValueOnce({ status: 401 })
          .mockResolvedValueOnce(user),
        refresh: vi.fn().mockResolvedValue({ access_token: 'new-token' }),
      })
      const service = new AuthService(repo, storage)

      const result = await service.validateToken()

      expect(result).toBe(true)
      expect(storage.set).toHaveBeenCalledWith('access_token', 'new-token')
    })

    it('devuelve false si el refresh falla sin ser 401 (no limpia sesión)', async () => {
      const storage = makeStorage()
      storage._store.access_token = 'expired-token'
      const repo = makeRepo({
        me: vi.fn().mockRejectedValue({ status: 401 }),
        refresh: vi.fn().mockRejectedValue(new Error('network')),
      })
      const service = new AuthService(repo, storage)

      const result = await service.validateToken()

      expect(result).toBe(false)
      // Session is NOT cleared on non-401 refresh failures (network errors, 5xx)
      expect(storage._store.access_token).toBe('expired-token')
    })
  })

  describe('logout', () => {
    it('llama a repo.logout y limpia la sesión', async () => {
      const storage = makeStorage()
      const repo = makeRepo({ logout: vi.fn().mockResolvedValue(null) })
      const service = new AuthService(repo, storage)

      await service.logout()

      expect(repo.logout).toHaveBeenCalled()
      expect(storage.remove).toHaveBeenCalledWith('access_token')
      expect(storage.remove).toHaveBeenCalledWith('refresh_token')
      expect(storage.remove).toHaveBeenCalledWith('user')
    })

    it('limpia la sesión aunque repo.logout falle', async () => {
      const storage = makeStorage()
      const repo = makeRepo({ logout: vi.fn().mockRejectedValue(new Error('network')) })
      const service = new AuthService(repo, storage)

      await service.logout()

      expect(storage.remove).toHaveBeenCalledWith('access_token')
    })
  })
})
