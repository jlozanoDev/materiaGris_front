import { describe, it, expect, vi, beforeEach } from 'vitest'
import ApiPatientRepository from '@/modules/patients/infrastructure/ApiPatientRepository'
import apiBase from '@/core/config/env'

describe('ApiPatientRepository', () => {
  beforeEach(() => {
    global.fetch = undefined
    localStorage.clear()
  })

  describe('search', () => {
    it('llama a /patients/find sin params si no hay filtros', async () => {
      const patients = [{ id: 1, first_name: 'Ana' }]
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ 'Content-Type': 'application/json' }),
          json: async () => patients,
        })
      )

      const repo = new ApiPatientRepository()
      const result = await repo.search({})

      expect(global.fetch).toHaveBeenCalledWith(
        `${apiBase}/patients/find`,
        expect.any(Object)
      )
      expect(result).toEqual(patients)
    })

    it('incluye los parámetros de filtro en la query string', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ 'Content-Type': 'application/json' }),
          json: async () => [],
        })
      )

      const repo = new ApiPatientRepository()
      await repo.search({ q: 'García', city: 'Madrid', gender: 'M' })

      const calledUrl = global.fetch.mock.calls[0][0]
      expect(calledUrl).toContain('q=Garc%C3%ADa')
      expect(calledUrl).toContain('city=Madrid')
      expect(calledUrl).toContain('gender=M')
    })

    it('incluye insurance[] para cada aseguradora', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ 'Content-Type': 'application/json' }),
          json: async () => [],
        })
      )

      const repo = new ApiPatientRepository()
      await repo.search({ insurance: ['1', '3'] })

      const calledUrl = global.fetch.mock.calls[0][0]
      expect(calledUrl).toContain('insurance%5B%5D=1')
      expect(calledUrl).toContain('insurance%5B%5D=3')
    })

    it('maneja una respuesta con propiedad data', async () => {
      const patients = [{ id: 2 }]
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ 'Content-Type': 'application/json' }),
          json: async () => ({ data: patients }),
        })
      )

      const repo = new ApiPatientRepository()
      const result = await repo.search({})

      expect(result).toEqual(patients)
    })
  })

  describe('create', () => {
    it('llama a POST /patients con el payload', async () => {
      const created = { id: 10, first_name: 'Luis' }
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 201,
          headers: new Headers({ 'Content-Type': 'application/json' }),
          json: async () => created,
        })
      )

      const repo = new ApiPatientRepository()
      const payload = { first_name: 'Luis', national_id: '12345678A', insurance_id: '' }
      const result = await repo.create(payload)

      const [url, opts] = global.fetch.mock.calls[0]
      expect(url).toBe(`${apiBase}/patients`)
      expect(opts.method).toBe('POST')
      // insurance_id vacío debe eliminarse del cuerpo
      const body = JSON.parse(opts.body)
      expect(body).not.toHaveProperty('insurance_id')
      expect(result).toEqual(created)
    })
  })

  describe('update', () => {
    it('llama a PUT /patients/{id} con el payload', async () => {
      const updated = { id: 12, first_name: 'Luis' }
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ 'Content-Type': 'application/json' }),
          json: async () => updated,
        })
      )

      const repo = new ApiPatientRepository()
      const payload = { first_name: 'Luis', insurance_id: '' }
      const result = await repo.update(12, payload)

      const [url, opts] = global.fetch.mock.calls[0]
      expect(url).toBe(`${apiBase}/patients/12`)
      expect(opts.method).toBe('PUT')
      const body = JSON.parse(opts.body)
      expect(body).not.toHaveProperty('insurance_id')
      expect(result).toEqual(updated)
    })
  })
})
