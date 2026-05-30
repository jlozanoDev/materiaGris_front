import { describe, it, expect, vi } from 'vitest'
import toastPlugin from '@/shared/plugins/toastPlugin'

describe('toastPlugin', () => {
  it('es un plugin con método install', () => {
    expect(toastPlugin).toHaveProperty('install')
    expect(typeof toastPlugin.install).toBe('function')
  })

  it('install registra $toast y provee "toast"', () => {
    const provided = {}
    const globals = {}
    const app = {
      config: { globalProperties: globals },
      provide: vi.fn((key, value) => { provided[key] = value })
    }

    toastPlugin.install(app)

    expect(app.provide).toHaveBeenCalledWith('toast', expect.any(Object))
    expect(provided.toast).toBeDefined()
    expect(globals.$toast).toBeDefined()
  })

  it('$toast y provided toast son el mismo objeto', () => {
    const provided = {}
    const globals = {}
    const app = {
      config: { globalProperties: globals },
      provide: vi.fn((key, value) => { provided[key] = value })
    }

    toastPlugin.install(app)

    expect(globals.$toast).toBe(provided.toast)
  })
})
