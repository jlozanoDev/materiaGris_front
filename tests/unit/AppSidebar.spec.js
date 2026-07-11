import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'

const authState = { user: null }
vi.mock('@/core/store/auth', () => ({
  useAuthStore: () => ({
    get user() { return authState.user },
    set user(v) { authState.user = v },
    hasPermission: (slug) => authState.user?.permissions?.[slug] === 1,
    hasPermissions: (slugs, mode) => {
      if (mode === 'any') return slugs.some((s) => authState.user?.permissions?.[s] === 1)
      return slugs.every((s) => authState.user?.permissions?.[s] === 1)
    },
    fetchUser: vi.fn().mockResolvedValue(null),
  }),
}))

import vHasPermission from '@/shared/directives/v-has-permission'
import AppSidebar from '@/shared/components/AppSidebar.vue'

const pushMock = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: pushMock, replace: vi.fn() }),
  useRoute: () => ({ path: '/' }),
}))

describe('AppSidebar visibility with permissions', () => {
  beforeEach(() => {
    pushMock.mockClear()
    authState.user = null
  })

  it('shows admin items when user has admin.user.view', async () => {
    authState.user = { id: 1, roles: ['admin'], permissions: { 'admin.user.view': 1, 'admin.role.view': 1 } }

    const wrapper = mount(AppSidebar, {
      global: {
        directives: { 'has-permission': vHasPermission },
      },
    })

    // Open the settings menu so the submenu items are rendered
    const settingsBtn = wrapper.find('button[title="Ajustes"]')
    await settingsBtn.trigger('click')
    await wrapper.vm.$nextTick()

    const btn = wrapper.find('button[title="Usuarios"]')
    expect(btn.exists()).toBe(true)
  })

  it('hides admin items when user lacks admin.user.view', async () => {
    authState.user = { id: 1, roles: [], permissions: { 'admin.role.view': 1 } }

    const wrapper = mount(AppSidebar, {
      global: {
        directives: { 'has-permission': vHasPermission },
      },
    })

    // Open the settings menu so the submenu is rendered
    const settingsBtn = wrapper.find('button[title="Ajustes"]')
    await settingsBtn.trigger('click')
    await wrapper.vm.$nextTick()

    const btn = wrapper.find('button[title="Usuarios"]')
    expect(btn.exists()).toBe(false)
  })
})
