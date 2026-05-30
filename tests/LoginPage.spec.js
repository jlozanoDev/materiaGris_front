import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// mock router push
const pushMock = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: pushMock }),
  useRoute: () => ({ query: {} }),
}))

import LoginPage from '@/modules/auth/presentation/pages/LoginView.vue'
import apiBase from '@/core/config/env'

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear()
    pushMock.mockClear()
    // reset fetch mock
    global.fetch = undefined
  })

  it('shows validation errors for empty fields and short password', async () => {
    const wrapper = mount(LoginPage)
    await wrapper.find('form').trigger('submit.prevent')
    expect(wrapper.html()).toContain('El email es obligatorio.')

    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.find('input[type="password"]').setValue('123')
    await wrapper.find('form').trigger('submit.prevent')
    expect(wrapper.html()).toContain('La contraseña debe tener al menos 6 caracteres.')
  })

  it('calls API and stores tokens on success and redirects', async () => {
    // mock successful fetch
    global.fetch = vi.fn(() => Promise.resolve({
      ok: true,
      status: 200,
      headers: new Headers({ 'Content-Type': 'application/json' }),
      json: async () => ({ access_token: 'abc123', refresh_token: 'ref123' })
    }))

    const wrapper = mount(LoginPage)
    await wrapper.find('input[type="email"]').setValue('user@example.com')
    await wrapper.find('input[type="password"]').setValue('password')

    await wrapper.find('form').trigger('submit.prevent')

    // wait for promises to resolve
    await new Promise(r => setTimeout(r, 0))

    expect(global.fetch).toHaveBeenCalled()
    expect(global.fetch.mock.calls[0][0]).toBe(`${apiBase}/auth/login`)
    expect(localStorage.getItem('access_token')).toBe('abc123')
    // router push should be called to '/'
    expect(pushMock).toHaveBeenCalled()
  })

  it('shows API error message on 401 response', async () => {
    global.fetch = vi.fn(() => Promise.resolve({
      ok: false,
      status: 400,
      headers: new Headers({ 'Content-Type': 'application/json' }),
      json: async () => ({ message: 'Nombre de usuario o contraseña inválidos' })
    }))

    const wrapper = mount(LoginPage)
    await wrapper.find('input[type="email"]').setValue('user@example.com')
    await wrapper.find('input[type="password"]').setValue('wrongpassword')

    await wrapper.find('form').trigger('submit.prevent')
    await new Promise(r => setTimeout(r, 0))

    expect(global.fetch).toHaveBeenCalled()
    expect(wrapper.html()).toContain('Nombre de usuario o contraseña inválidos')
  })

  it('shows network/CORS error when fetch throws', async () => {
    global.fetch = vi.fn(() => Promise.reject(new TypeError('Failed to fetch')))

    const wrapper = mount(LoginPage)
    await wrapper.find('input[type="email"]').setValue('user@example.com')
    await wrapper.find('input[type="password"]').setValue('password')

    await wrapper.find('form').trigger('submit.prevent')
    await new Promise(r => setTimeout(r, 0))

    expect(global.fetch).toHaveBeenCalled()
    expect(wrapper.html()).toContain('Error de conexión')
  })
})
