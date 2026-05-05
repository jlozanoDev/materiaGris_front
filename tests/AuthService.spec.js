import { describe, it, expect, vi, beforeEach } from 'vitest'
import AuthService from '@/modules/auth/domain/services/AuthService'

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
    it('devuelve false si no hay token en localStorage', async () => {
      const repo = makeRepo()
      const service = new AuthService(repo)
      const result = await service.validateToken()
      expect(result).toBe(false)
      expect(repo.me).not.toHaveBeenCalled()
    })

    it('devuelve true y guarda el usuario si el token es válido', async () => {
      localStorage.setItem('access_token', 'valid-token')
      const user = { id: 1, name: 'Ana' }
      const repo = makeRepo({ me: vi.fn().mockResolvedValue(user) })
      const service = new AuthService(repo)

      const result = await service.validateToken()

      expect(result).toBe(true)
      expect(JSON.parse(localStorage.getItem('user'))).toEqual(user)
    })

    it('intenta refresh si /me responde 401 y retorna true si el refresh funciona', async () => {
      localStorage.setItem('access_token', 'expired-token')
      const user = { id: 1, name: 'Ana' }
      const repo = makeRepo({
        me: vi.fn()
          .mockRejectedValueOnce({ status: 401 })
          .mockResolvedValueOnce(user),
        refresh: vi.fn().mockResolvedValue({ access_token: 'new-token' }),
      })
      const service = new AuthService(repo)

      const result = await service.validateToken()

      expect(result).toBe(true)
      expect(localStorage.getItem('access_token')).toBe('new-token')
    })

    it('limpia la sesión y devuelve false si el refresh falla', async () => {
      localStorage.setItem('access_token', 'expired-token')
      localStorage.setItem('refresh_token', 'ref')
      const repo = makeRepo({
        me: vi.fn().mockRejectedValue({ status: 401 }),
        refresh: vi.fn().mockRejectedValue(new Error('network')),
      })
      const service = new AuthService(repo)

      const result = await service.validateToken()

      expect(result).toBe(false)
      expect(localStorage.getItem('access_token')).toBeNull()
      expect(localStorage.getItem('refresh_token')).toBeNull()
    })
  })

  describe('logout', () => {
    it('llama a repo.logout y limpia la sesión', async () => {
      localStorage.setItem('access_token', 'tok')
      localStorage.setItem('refresh_token', 'ref')
      localStorage.setItem('user', '{}')

      const repo = makeRepo({ logout: vi.fn().mockResolvedValue(null) })
      const service = new AuthService(repo)

      await service.logout()

      expect(repo.logout).toHaveBeenCalled()
      expect(localStorage.getItem('access_token')).toBeNull()
      expect(localStorage.getItem('refresh_token')).toBeNull()
      expect(localStorage.getItem('user')).toBeNull()
    })

    it('limpia la sesión aunque repo.logout falle', async () => {
      localStorage.setItem('access_token', 'tok')
      const repo = makeRepo({ logout: vi.fn().mockRejectedValue(new Error('network')) })
      const service = new AuthService(repo)

      await service.logout()

      expect(localStorage.getItem('access_token')).toBeNull()
    })
  })
})
