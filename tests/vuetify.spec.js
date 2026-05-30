import { describe, it, expect, vi } from 'vitest'

// Mock vuetify module so CSS files aren't loaded
vi.mock('vuetify', () => ({
  createVuetify: vi.fn(() => ({
    install: vi.fn(),
    theme: { themes: { light: { colors: { primary: '#1867C0', secondary: '#5CBBF6' } } } },
  })),
}))

vi.mock('vuetify/components', () => ({}))
vi.mock('vuetify/directives', () => ({}))

describe('vuetify plugin', () => {
  it('exports a Vuetify plugin instance', async () => {
    const vuetify = (await import('@/plugins/vuetify')).default
    expect(vuetify).toBeDefined()
    expect(typeof vuetify).toBe('object')
  })

  it('has install method', async () => {
    const vuetify = (await import('@/plugins/vuetify')).default
    expect(vuetify).toHaveProperty('install')
    expect(typeof vuetify.install).toBe('function')
  })

  it('has theme configuration', async () => {
    const vuetify = (await import('@/plugins/vuetify')).default
    expect(vuetify.theme).toBeDefined()
  })
})
