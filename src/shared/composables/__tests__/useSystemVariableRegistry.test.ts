import { describe, it, expect, vi } from 'vitest'

// Mock fetchClient so ensureLoaded fails, triggering fallback registration
vi.mock('@/core/api/httpClient', () => ({
  fetchClient: vi.fn().mockRejectedValue(new Error('Network error')),
}))

import { useSystemVariableRegistry } from '../useSystemVariableRegistry'

describe('useSystemVariableRegistry — fallback variables', () => {
  it('includes clinica.logo in fallback registry search', async () => {
    const registry = useSystemVariableRegistry()

    // ensureLoaded will fail (mock rejected) and register fallback variables
    await registry.ensureLoaded()

    const results = registry.search('clinica')

    const logoEntry = results.find((v) => v.key === 'logo')
    expect(logoEntry).toBeDefined()
    expect(logoEntry!.category).toBe('clinica')
    expect(logoEntry!.label).toBe('Logo de la clínica')
  })

  it('returns clinica.logo entry when searching by full key', async () => {
    const registry = useSystemVariableRegistry()

    await registry.ensureLoaded()

    const results = registry.search('clinica.logo')

    expect(results).toHaveLength(1)
    expect(results[0].key).toBe('logo')
    expect(results[0].category).toBe('clinica')
  })
})
