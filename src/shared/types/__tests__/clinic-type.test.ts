import { describe, it, expect } from 'vitest'
import type { Clinic } from '@/shared/types'

describe('Clinic type — logo field', () => {
  it('can have logo as a URL string', () => {
    const clinic: Clinic = {
      id: 1,
      nombre: 'Test',
      direccion: 'Calle 123',
      telefono: '123',
      email: 'a@b.com',
      ciudad: 'City',
      provincia: 'Prov',
      codigo_postal: '0000',
      logo: 'https://example.com/storage/logos/1_abc.png',
    }

    // Production code: the Clinic type now includes `logo?: string | null`
    // We assert that when set, it stores the URL as provided
    expect(clinic.logo).toBe('https://example.com/storage/logos/1_abc.png')
  })

  it('accepts null for logo', () => {
    const clinic: Clinic = {
      id: 2,
      nombre: 'Test',
      direccion: 'Calle 456',
      telefono: '456',
      email: 'b@b.com',
      ciudad: 'City',
      provincia: 'Prov',
      codigo_postal: '0000',
      logo: null,
    }

    // Production code: null means no logo uploaded
    expect(clinic.logo).toBeNull()
  })

  it('accepts undefined for logo (optional)', () => {
    const clinic: Clinic = {
      id: 3,
      nombre: 'Test',
      direccion: 'Calle 789',
      telefono: '789',
      email: 'c@c.com',
      ciudad: 'City',
      provincia: 'Prov',
      codigo_postal: '0000',
    }

    // Production code: undefined means the field was not provided
    expect(clinic.logo).toBeUndefined()
  })
})
