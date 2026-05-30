import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import ApiRoleRepository from '@/modules/admin/roles/infrastructure/ApiRoleRepository'
import apiBase from '@/core/config/env'

describe('ApiRoleRepository — uncovered paths', () => {
  let originalFetch

  beforeEach(() => {
    originalFetch = global.fetch
  })

  afterEach(() => {
    global.fetch = originalFetch
    vi.restoreAllMocks()
  })

  // ── getById ─────────────────────────────────────────────────────
  describe('getById', () => {
    it('fetches a single role by id', async () => {
      const role = { id: 5, name: 'Editor' }
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: async () => role,
      })

      const repo = new ApiRoleRepository()
      const result = await repo.getById(5)

      expect(global.fetch).toHaveBeenCalled()
      expect(global.fetch.mock.calls[0][0]).toBe(`${apiBase}/admin/roles/5`)
      expect(result).toEqual(role)
    })

    it('throws generic error on fetch failure', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('network'))
      const repo = new ApiRoleRepository()
      await expect(repo.getById(99)).rejects.toThrow('Error al obtener rol')
    })
  })

  // ── update ──────────────────────────────────────────────────────
  describe('update', () => {
    it('updates a role and returns result', async () => {
      const updated = { id: 3, name: 'Updated Role' }
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: async () => updated,
      })

      const repo = new ApiRoleRepository()
      const result = await repo.update(3, { name: 'Updated Role' })

      expect(global.fetch).toHaveBeenCalled()
      expect(global.fetch.mock.calls[0][0]).toBe(`${apiBase}/admin/roles/3`)
      expect(result).toEqual(updated)
    })

    it('re-throws 422 validation errors directly', async () => {
      const validationBody = { message: 'Name is required', errors: { name: ['required'] } }
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 422,
        headers: { get: () => 'application/json' },
        json: async () => validationBody,
      })

      const repo = new ApiRoleRepository()
      try {
        await repo.update(3, { name: '' })
        expect.unreachable('should have thrown')
      } catch (err) {
        expect(err).toHaveProperty('status', 422)
        expect(err).toHaveProperty('body')
        expect(err.body).toEqual(validationBody)
      }
    })

    it('throws generic error for non-422 failures', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        headers: { get: () => 'text/plain' },
        text: async () => 'Server error',
      })

      const repo = new ApiRoleRepository()
      await expect(repo.update(3, { name: 'X' })).rejects.toThrow('Error al actualizar rol')
    })
  })

  // ── delete ──────────────────────────────────────────────────────
  describe('delete', () => {
    it('deletes a role by id', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
        headers: { get: () => '' },
        text: async () => '',
      })

      const repo = new ApiRoleRepository()
      const result = await repo.delete(7)

      expect(global.fetch).toHaveBeenCalled()
      expect(global.fetch.mock.calls[0][0]).toBe(`${apiBase}/admin/roles/7`)
      expect(result).toBe('')
    })

    it('throws generic error on deletion failure', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('network'))
      const repo = new ApiRoleRepository()
      await expect(repo.delete(99)).rejects.toThrow('Error al eliminar rol')
    })
  })

  // ── create (error paths) ────────────────────────────────────────
  describe('create error paths', () => {
    it('re-throws 422 validation error', async () => {
      const validationBody = { message: 'Role name required' }
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 422,
        headers: { get: () => 'application/json' },
        json: async () => validationBody,
      })

      const repo = new ApiRoleRepository()
      try {
        await repo.create({ name: '' })
        expect.unreachable('should have thrown')
      } catch (err) {
        expect(err).toHaveProperty('status', 422)
        expect(err.body).toEqual(validationBody)
      }
    })

    it('throws generic error for non-422 failures', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        headers: { get: () => 'text/plain' },
        text: async () => 'Server error',
      })

      const repo = new ApiRoleRepository()
      await expect(repo.create({ name: 'X' })).rejects.toThrow('Error al crear rol')
    })
  })
})
