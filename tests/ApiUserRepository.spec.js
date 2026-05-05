import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import ApiUserRepository from '@/modules/auth/infrastructure/ApiUserRepository'

describe('ApiUserRepository', () => {
  let originalFetch

  beforeEach(() => {
    originalFetch = global.fetch
  })

  afterEach(() => {
    global.fetch = originalFetch
    vi.restoreAllMocks()
  })

  it('should call fetch for create and return parsed body', async () => {
    const repo = new ApiUserRepository()

    const mockBody = { id: 1, name: 'New', email: 'new@example.com' }

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      headers: { get: () => 'application/json' },
      json: async () => mockBody
    })

    const res = await repo.create({ name: 'New', email: 'new@example.com' })
    expect(global.fetch).toHaveBeenCalled()
    expect(res).toEqual(mockBody)
  })

  it('should call fetch for update and return parsed body', async () => {
    const repo = new ApiUserRepository()

    const mockBody = { id: 2, name: 'Updated' }

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => mockBody
    })

    const res = await repo.update(2, { name: 'Updated' })
    expect(global.fetch).toHaveBeenCalled()
    expect(res).toEqual(mockBody)
  })

  it('should call fetch for delete and return null body when empty', async () => {
    const repo = new ApiUserRepository()

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      headers: { get: () => '' },
      text: async () => ''
    })

    const res = await repo.delete(3)
    expect(global.fetch).toHaveBeenCalled()
    expect(res).toBe('')
  })
})
