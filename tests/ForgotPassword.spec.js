import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const pushMock = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: pushMock }),
  RouterLink: { template: '<a><slot /></a>' },
}))

import ForgotPasswordPage from '@/modules/auth/presentation/pages/ForgotPasswordPage.vue'
import apiBase from '@/core/config/env'

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    pushMock.mockClear()
    global.fetch = undefined
  })

  it('muestra error si se envía con email vacío', async () => {
    const wrapper = mount(ForgotPasswordPage)
    await wrapper.find('form').trigger('submit.prevent')
    expect(wrapper.html()).toContain('El email es obligatorio.')
  })

  it('llama a la API con el email correcto y muestra confirmación', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        headers: new Headers({ 'Content-Type': 'application/json' }),
        json: async () => ({ message: 'Si el email está registrado, recibirás un enlace para restablecer tu contraseña.' }),
      })
    )

    const wrapper = mount(ForgotPasswordPage)
    await wrapper.find('input[type="email"]').setValue('user@ejemplo.com')
    await wrapper.find('form').trigger('submit.prevent')
    await new Promise(r => setTimeout(r, 0))

    expect(global.fetch).toHaveBeenCalledWith(
      `${apiBase}/auth/forgot`,
      expect.objectContaining({ method: 'POST' })
    )

    // Mostrar estado de éxito
    expect(wrapper.html()).toContain('user@ejemplo.com')
    expect(wrapper.html()).toContain('recibirás en breve')
  })

  it('muestra error de rate limit (429)', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 429,
        headers: new Headers({ 'Content-Type': 'application/json' }),
        json: async () => ({ message: 'Too Many Requests' }),
      })
    )

    const wrapper = mount(ForgotPasswordPage)
    await wrapper.find('input[type="email"]').setValue('user@ejemplo.com')
    await wrapper.find('form').trigger('submit.prevent')
    await new Promise(r => setTimeout(r, 0))

    expect(wrapper.html()).toContain('Demasiados intentos')
  })

  it('muestra error genérico en fallo de red', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('Network error')))

    const wrapper = mount(ForgotPasswordPage)
    await wrapper.find('input[type="email"]').setValue('user@ejemplo.com')
    await wrapper.find('form').trigger('submit.prevent')
    await new Promise(r => setTimeout(r, 0))

    expect(wrapper.html()).toContain('Error de conexión')
  })
})
