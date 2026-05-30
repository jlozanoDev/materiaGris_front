import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const pushMock = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: pushMock }),
  useRoute: () => ({ query: { token: 'token-test-64-chars', email: 'user@ejemplo.com' } }),
  RouterLink: { template: '<a><slot /></a>' },
}))

import ResetPasswordPage from '@/modules/auth/presentation/pages/ResetPasswordPage.vue'
import apiBase from '@/core/config/env'

const mountOptions = {
  global: {
    stubs: {
      'router-link': { template: '<a><slot /></a>' }
    }
  }
}

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    pushMock.mockClear()
    global.fetch = undefined
  })

  it('muestra error si la contraseña tiene menos de 8 caracteres', async () => {
    const wrapper = mount(ResetPasswordPage, mountOptions)
    await wrapper.find('input[autocomplete="new-password"]').setValue('corto')
    await wrapper.find('form').trigger('submit.prevent')
    expect(wrapper.html()).toContain('al menos 8 caracteres')
  })

  it('muestra error si las contraseñas no coinciden', async () => {
    const wrapper = mount(ResetPasswordPage, mountOptions)
    const inputs = wrapper.findAll('input[autocomplete="new-password"]')
    await inputs[0].setValue('Password123')
    await inputs[1].setValue('Diferente123')
    await wrapper.find('form').trigger('submit.prevent')
    expect(wrapper.html()).toContain('no coinciden')
  })

  it('llama a la API y muestra éxito al resetear correctamente', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        headers: new Headers({ 'Content-Type': 'application/json' }),
        json: async () => ({ message: 'Contraseña restablecida correctamente. Ya puedes iniciar sesión.' }),
      })
    )

    const wrapper = mount(ResetPasswordPage, mountOptions)
    const inputs = wrapper.findAll('input[autocomplete="new-password"]')
    await inputs[0].setValue('NuevaPassword123')
    await inputs[1].setValue('NuevaPassword123')
    await wrapper.find('form').trigger('submit.prevent')
    await new Promise(r => setTimeout(r, 0))

    expect(global.fetch).toHaveBeenCalledWith(
      `${apiBase}/auth/reset`,
      expect.objectContaining({ method: 'POST' })
    )

    expect(wrapper.html()).toContain('restablecida correctamente')
  })

  it('muestra error si el token es inválido o expiró (422)', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 422,
        headers: new Headers({ 'Content-Type': 'application/json' }),
        json: async () => ({ message: 'El token de reseteo es inválido o ha expirado.' }),
      })
    )

    const wrapper = mount(ResetPasswordPage, mountOptions)
    const inputs = wrapper.findAll('input[autocomplete="new-password"]')
    await inputs[0].setValue('NuevaPassword123')
    await inputs[1].setValue('NuevaPassword123')
    await wrapper.find('form').trigger('submit.prevent')
    await new Promise(r => setTimeout(r, 0))

    expect(wrapper.html()).toContain('inválido o ha expirado')
  })

  it('muestra error de red ante fallo de conexión', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('Network error')))

    const wrapper = mount(ResetPasswordPage, mountOptions)
    const inputs = wrapper.findAll('input[autocomplete="new-password"]')
    await inputs[0].setValue('NuevaPassword123')
    await inputs[1].setValue('NuevaPassword123')
    await wrapper.find('form').trigger('submit.prevent')
    await new Promise(r => setTimeout(r, 0))

    expect(wrapper.html()).toContain('Error de conexión')
  })

  it('al pulsar iniciar sesión tras éxito redirige a /login', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        headers: new Headers({ 'Content-Type': 'application/json' }),
        json: async () => ({ message: 'Contraseña restablecida correctamente. Ya puedes iniciar sesión.' }),
      })
    )

    const wrapper = mount(ResetPasswordPage, mountOptions)
    const inputs = wrapper.findAll('input[autocomplete="new-password"]')
    await inputs[0].setValue('NuevaPassword123')
    await inputs[1].setValue('NuevaPassword123')
    await wrapper.find('form').trigger('submit.prevent')
    await new Promise(r => setTimeout(r, 0))

    await wrapper.find('button').trigger('click')
    expect(pushMock).toHaveBeenCalledWith('/login')
  })
})
