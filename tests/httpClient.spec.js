import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  fetchClient,
  setUnauthorizedHandler,
  setTokenGetter,
} from '@/core/api/httpClient'

vi.mock('@/core/config/env', () => ({
  API_BASE: 'https://api.example.com',
}))

// Re-import after mock so the module picks up the mocked API_BASE
const mod = await import('@/core/api/httpClient')
const { fetchClient: fc, setUnauthorizedHandler: suh, setTokenGetter: stg } = mod

describe('httpClient', () => {
  let originalFetch

  beforeEach(() => {
    originalFetch = global.fetch
    // Reset module-level state
    suh(() => {})
    stg(() => null)
    vi.useFakeTimers()
  })

  afterEach(() => {
    global.fetch = originalFetch
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  // ---------------------------------------------------------------------------
  // Path resolution
  // ---------------------------------------------------------------------------
  describe('path resolution', () => {
    it('resolves relative path against API_BASE', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: { get: () => 'application/json' },
        json: async () => ({ data: true }),
      })

      await fc('/users')

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/users',
        expect.objectContaining({}),
      )
    })

    it('resolves relative path without leading slash correctly', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: { get: () => 'application/json' },
        json: async () => ({}),
      })

      await fc('users')

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/users',
        expect.objectContaining({}),
      )
    })

    it('keeps absolute http URL unchanged', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: { get: () => 'application/json' },
        json: async () => ({}),
      })

      await fc('http://other.example.com/resource')

      expect(global.fetch).toHaveBeenCalledWith(
        'http://other.example.com/resource',
        expect.objectContaining({}),
      )
    })

    it('keeps absolute https URL unchanged', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: { get: () => 'application/json' },
        json: async () => ({}),
      })

      await fc('https://other.example.com/resource')

      expect(global.fetch).toHaveBeenCalledWith(
        'https://other.example.com/resource',
        expect.objectContaining({}),
      )
    })
  })

  // ---------------------------------------------------------------------------
  // Auth header
  // ---------------------------------------------------------------------------
  describe('auth header', () => {
    it('adds Bearer token when tokenGetter returns a token', async () => {
      stg(() => 'my-token-123')

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: { get: () => 'application/json' },
        json: async () => ({ ok: true }),
      })

      await fc('/secure')

      const callOpts = global.fetch.mock.calls[0][1]
      expect(callOpts.headers.Authorization).toBe('Bearer my-token-123')
    })

    it('does NOT add auth header when tokenGetter returns null', async () => {
      stg(() => null)

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: { get: () => 'application/json' },
        json: async () => ({}),
      })

      await fc('/public')

      const callOpts = global.fetch.mock.calls[0][1]
      expect(callOpts.headers.Authorization).toBeUndefined()
    })

    it('does NOT add auth header when tokenGetter is not set', async () => {
      // reset to module default
      stg(null)

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: { get: () => 'application/json' },
        json: async () => ({}),
      })

      await fc('/public')

      const callOpts = global.fetch.mock.calls[0][1]
      expect(callOpts.headers.Authorization).toBeUndefined()
    })

    it('does NOT override Authorization header if already present', async () => {
      stg(() => 'token-from-getter')

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: { get: () => 'application/json' },
        json: async () => ({}),
      })

      await fc('/secure', {
        headers: { Authorization: 'Custom value' },
      })

      const callOpts = global.fetch.mock.calls[0][1]
      expect(callOpts.headers.Authorization).toBe('Custom value')
    })
  })

  // ---------------------------------------------------------------------------
  // Content-Type
  // ---------------------------------------------------------------------------
  describe('Content-Type header', () => {
    it('sets Content-Type to application/json by default', async () => {
      stg(() => null)

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: { get: () => 'application/json' },
        json: async () => ({}),
      })

      await fc('/endpoint')

      const callOpts = global.fetch.mock.calls[0][1]
      expect(callOpts.headers['Content-Type']).toBe('application/json')
    })

    it('does NOT set Content-Type when body is FormData', async () => {
      stg(() => null)

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: { get: () => 'application/json' },
        json: async () => ({}),
      })

      // jsdom's FormData check works via instanceof
      const fd = new FormData()
      fd.append('file', new Blob([]), 'photo.png')
      await fc('/upload', { method: 'POST', body: fd })

      const callOpts = global.fetch.mock.calls[0][1]
      expect(callOpts.headers['Content-Type']).toBeUndefined()
    })

    it('respects explicitly set Content-Type header', async () => {
      stg(() => null)

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: { get: () => 'text/plain' },
        text: async () => 'ok',
      })

      await fc('/endpoint', {
        headers: { 'Content-Type': 'text/plain' },
      })

      const callOpts = global.fetch.mock.calls[0][1]
      expect(callOpts.headers['Content-Type']).toBe('text/plain')
    })
  })

  // ---------------------------------------------------------------------------
  // Credentials
  // ---------------------------------------------------------------------------
  describe('credentials', () => {
    it('sets credentials to "include" by default', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: { get: () => 'application/json' },
        json: async () => ({}),
      })

      await fc('/x')

      const callOpts = global.fetch.mock.calls[0][1]
      expect(callOpts.credentials).toBe('include')
    })

    it('respects explicitly set credentials', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: { get: () => 'application/json' },
        json: async () => ({}),
      })

      await fc('/x', { credentials: 'omit' })

      const callOpts = global.fetch.mock.calls[0][1]
      expect(callOpts.credentials).toBe('omit')
    })
  })

  // ---------------------------------------------------------------------------
  // Success responses
  // ---------------------------------------------------------------------------
  describe('success responses', () => {
    it('returns parsed JSON body on json response', async () => {
      const payload = { items: [1, 2, 3] }
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json; charset=utf-8' },
        json: async () => payload,
      })

      const result = await fc('/json')

      expect(result).toEqual(payload)
    })

    it('returns text body on non-json response', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => 'text/plain' },
        text: async () => 'hello world',
      })

      const result = await fc('/text')

      expect(result).toBe('hello world')
    })

    it('returns null when json() throws during parse', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: async () => { throw new Error('Parse error') },
      })

      const result = await fc('/broken-json')

      expect(result).toBeNull()
    })
  })

  // ---------------------------------------------------------------------------
  // Error responses
  // ---------------------------------------------------------------------------
  describe('error responses', () => {
    it('rejects with ApiError on non-ok response (non-401)', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 422,
        headers: { get: () => 'application/json' },
        json: async () => ({ message: 'Validation error' }),
      })

      await expect(fc('/validate')).rejects.toEqual({
        status: 422,
        body: { message: 'Validation error' },
      })
    })

    it('rejects with ApiError on 500', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        headers: { get: () => 'text/plain' },
        text: async () => 'Internal Server Error',
      })

      await expect(fc('/error')).rejects.toEqual({
        status: 500,
        body: 'Internal Server Error',
      })
    })
  })

  // ---------------------------------------------------------------------------
  // 401 handling
  // ---------------------------------------------------------------------------
  describe('401 handling', () => {
    it('rejects without invoking callback when ignoreUnauthorized is true', async () => {
      const cb = vi.fn()
      suh(cb)

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        headers: { get: () => 'application/json' },
        json: async () => ({ message: 'Unauthorized' }),
      })

      await expect(
        fc('/private', { ignoreUnauthorized: true }),
      ).rejects.toEqual({
        status: 401,
        body: { message: 'Unauthorized' },
      })

      expect(cb).not.toHaveBeenCalled()
    })

    it('calls unauthorized callback and rejects on 401', async () => {
      const cb = vi.fn()
      suh(cb)

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        headers: { get: () => 'application/json' },
        json: async () => ({ message: 'Token expired' }),
      })

      await expect(fc('/private')).rejects.toEqual({
        status: 401,
        body: { message: 'Token expired' },
      })

      expect(cb).toHaveBeenCalled()
    })

    it('redirects to /login when no unauthorized callback is set', async () => {
      // remove the callback set in beforeEach
      suh(null)

      // jsdom has window.location; mock href setter
      const hrefSetter = vi.fn()
      delete window.location
      window.location = { href: '' }
      Object.defineProperty(window.location, 'href', { set: hrefSetter, get: () => '/login' })

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        headers: { get: () => 'application/json' },
        json: async () => ({ message: 'Unauthorized' }),
      })

      await expect(fc('/private')).rejects.toEqual({
        status: 401,
        body: { message: 'Unauthorized' },
      })

      expect(hrefSetter).toHaveBeenCalledWith('/login')
    })
  })

  // ---------------------------------------------------------------------------
  // Timeout
  // ---------------------------------------------------------------------------
  describe('timeout', () => {
    it('rejects with timeout message after 30 seconds', async () => {
      // Mock that rejects with AbortError when the timeout fires
      global.fetch = vi.fn((_url, opts) => {
        return new Promise((_resolve, reject) => {
          opts.signal.addEventListener('abort', () => {
            const err = new Error('The operation was aborted')
            err.name = 'AbortError'
            reject(err)
          })
        })
      })

      const promise = fc('/slow')

      // Advance time past the 30s timeout
      vi.advanceTimersByTime(31000)

      await expect(promise).rejects.toEqual({
        status: 0,
        body: { message: 'La solicitud tardó demasiado' },
      })
    })
  })

  // ---------------------------------------------------------------------------
  // Connection errors
  // ---------------------------------------------------------------------------
  describe('connection errors', () => {
    it('rejects with connection error message on network failure', async () => {
      global.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))

      await expect(fc('/offline')).rejects.toEqual({
        status: 0,
        body: { message: 'Error de conexión' },
      })
    })
  })
})
