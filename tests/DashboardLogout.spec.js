import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// mock router replace
const replaceMock = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ replace: replaceMock }),
  useRoute: () => ({ path: '/' })
}))

import AppSidebar from '@/shared/components/AppSidebar.vue'
import apiBase from '@/core/config/env'

describe('AppSidebar logout', () => {
  beforeEach(() => {
    replaceMock.mockClear()
    localStorage.setItem('access_token', 'tok')
    localStorage.setItem('refresh_token', 'ref')
    global.fetch = undefined
  })

  it('calls logout API, clears storage and redirects', async () => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: true }))

    const wrapper = mount(AppSidebar)

    const buttons = wrapper.findAll('button')
    // logout is the last button in the sidebar
    const logoutBtn = buttons.at(buttons.length - 1)
    await logoutBtn.trigger('click')

    // wait the toast delay (900ms) plus small margin
    await new Promise(r => setTimeout(r, 1000))

    expect(global.fetch).toHaveBeenCalled()
    expect(global.fetch.mock.calls[0][0]).toBe(`${apiBase}/auth/logout`)
    expect(global.fetch.mock.calls[0][1].method).toBe('POST')
    expect(global.fetch.mock.calls[0][1].credentials).toBe('include')

    expect(localStorage.getItem('access_token')).toBeNull()
    expect(localStorage.getItem('refresh_token')).toBeNull()
    expect(replaceMock).toHaveBeenCalledWith({ name: 'Login' })
  })
})
