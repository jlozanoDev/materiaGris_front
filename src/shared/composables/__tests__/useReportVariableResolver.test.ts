import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useReportVariableResolver } from '../useReportVariableResolver'
import type { AuthUser, Clinic } from '@/shared/types'

describe('useReportVariableResolver — clinica.logo', () => {
  it('resolves clinica.logo to img HTML when clinic has logo', () => {
    const clinic = ref<Clinic | null>({
      id: 1,
      nombre: 'Test',
      direccion: 'Calle 123',
      telefono: '123',
      email: 'a@b.com',
      ciudad: 'City',
      provincia: 'Prov',
      codigo_postal: '0000',
      logo: 'https://example.com/storage/logos/1_abc.png',
    })
    const user = ref<AuthUser | null>(null)

    const { resolve } = useReportVariableResolver(user, clinic)

    const result = resolve('{clinica.logo}')
    expect(result).toBe(
      '<img src="https://example.com/storage/logos/1_abc.png" alt="Logo" style="max-width:100%">',
    )
  })

  it('resolves clinica.logo to empty string when logo is null', () => {
    const clinic = ref<Clinic | null>({
      id: 1,
      nombre: 'Test',
      direccion: 'Calle 123',
      telefono: '123',
      email: 'a@b.com',
      ciudad: 'City',
      provincia: 'Prov',
      codigo_postal: '0000',
      logo: null,
    })
    const user = ref<AuthUser | null>(null)

    const { resolve } = useReportVariableResolver(user, clinic)

    const result = resolve('{clinica.logo}')
    expect(result).toBe('')
  })

  it('resolves clinica.logo to empty string when clinic is null', () => {
    const clinic = ref<Clinic | null>(null)
    const user = ref<AuthUser | null>(null)

    const { resolve } = useReportVariableResolver(user, clinic)

    const result = resolve('{clinica.logo}')
    expect(result).toBe('')
  })
})
