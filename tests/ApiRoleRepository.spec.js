import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import ApiRoleRepository from '@/modules/admin/roles/infrastructure/ApiRoleRepository'

describe('ApiRoleRepository', () => {
  let originalFetch

  beforeEach(() => {
    originalFetch = global.fetch
  })

  afterEach(() => {
    global.fetch = originalFetch
    vi.restoreAllMocks()
  })

  it('should call fetch for all roles', async () => {
    const repo = new ApiRoleRepository()
    const mockRoles = [{ id: 1, name: 'Admin' }]

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => mockRoles
    })

    const res = await repo.all()
    expect(global.fetch).toHaveBeenCalled()
    expect(res).toEqual(mockRoles)
  })

  it('should call fetch for create', async () => {
    const repo = new ApiRoleRepository()
    const mockRole = { id: 1, name: 'New Role' }

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      headers: { get: () => 'application/json' },
      json: async () => mockRole
    })

    const res = await repo.create({ name: 'New Role' })
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/admin/roles'), expect.any(Object))
    expect(res).toEqual(mockRole)
  })
})
