import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import ApiUserRepository from '@/modules/auth/infrastructure/ApiUserRepository'
import apiBase from '@/core/config/env'

describe('ApiUserRepository (auth) — uncovered paths', () => {
  let originalFetch

  beforeEach(() => {
    originalFetch = global.fetch
  })

  afterEach(() => {
    global.fetch = originalFetch
    vi.restoreAllMocks()
  })

  // ── forgot ──────────────────────────────────────────────────────
  describe('forgot', () => {
    it('returns {status:200, data} on success', async () => {
      const fakeData = { message: 'Email sent' }
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: async () => fakeData,
      })

      const repo = new ApiUserRepository()
      const result = await repo.forgot('user@example.com')

      expect(global.fetch).toHaveBeenCalled()
      expect(result).toEqual({ status: 200, data: fakeData })
    })

    it('returns {status, data} when fetchClient rejects with status', async () => {
      const errorBody = { message: 'Not found' }
      // fetchClient rejects with {status, body} when response is not ok
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        headers: { get: () => 'application/json' },
        json: async () => errorBody,
      })

      const repo = new ApiUserRepository()
      const result = await repo.forgot('unknown@example.com')

      expect(result).toEqual({ status: 404, data: errorBody })
    })
  })

  // ── refresh ─────────────────────────────────────────────────────
  describe('refresh', () => {
    it('calls /auth/refresh and returns body', async () => {
      const tokenData = { token: 'new-jwt' }
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: async () => tokenData,
      })

      const repo = new ApiUserRepository()
      const result = await repo.refresh()

      expect(global.fetch).toHaveBeenCalled()
      expect(global.fetch.mock.calls[0][0]).toBe(`${apiBase}/auth/refresh`)
      expect(result).toEqual(tokenData)
    })
  })

  // ── reset ───────────────────────────────────────────────────────
  describe('reset', () => {
    it('calls /auth/reset with token and password data', async () => {
      const resetResponse = { message: 'Password reset' }
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: async () => resetResponse,
      })

      const repo = new ApiUserRepository()
      const payload = { token: 'abc123', password: 'newpass', password_confirmation: 'newpass' }
      const result = await repo.reset(payload)

      expect(global.fetch).toHaveBeenCalled()
      expect(global.fetch.mock.calls[0][0]).toBe(`${apiBase}/auth/reset`)
      expect(result).toEqual(resetResponse)
    })
  })
})
