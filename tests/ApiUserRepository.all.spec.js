import { describe, it, expect, vi, beforeEach } from 'vitest'
import ApiAdminUserRepository from '@/modules/admin/users/infrastructure/ApiAdminUserRepository'
import apiBase from '@/core/config/env'

describe('ApiAdminUserRepository.all', () => {
  beforeEach(() => {
    // reset global.fetch between tests
    global.fetch = undefined
  })

  it('uses fetch when available and returns parsed JSON', async () => {
    const fakeUsers = [{ id: 2, name: 'Bob', email: 'bob@example.com' }]
    global.fetch = vi.fn(() => Promise.resolve({
      ok: true,
      status: 200,
      headers: new Headers({ 'Content-Type': 'application/json' }),
      json: async () => fakeUsers
    }))

    const repo = new ApiAdminUserRepository()
    const res = await repo.all()

    expect(global.fetch).toHaveBeenCalled()
    expect(global.fetch.mock.calls[0][0]).toBe(`${apiBase}/admin/users`)
    expect(res).toEqual(fakeUsers)
  })

  it('throws an error when response is not ok', async () => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: false, text: async () => 'error' }))
    const repo = new ApiAdminUserRepository()
    await expect(repo.all()).rejects.toThrow('Error al obtener usuarios')
  })
})
