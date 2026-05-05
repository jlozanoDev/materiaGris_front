import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import vHasPermission from '@/shared/directives/v-has-permission'
import AppSidebar from '@/shared/components/AppSidebar.vue'
import { useAuthStore } from '@/core/store/auth'

const pushMock = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: pushMock, replace: vi.fn() }),
  useRoute: () => ({ path: '/' }),
}))

describe('AppSidebar visibility with permissions', () => {
  beforeEach(() => {
    pushMock.mockClear()
  })

  it('shows admin items when user has admin.user.view', async () => {
    const store = useAuthStore()
    store.user = { id: 1, roles: ['admin'], permissions: { 'admin.user.view': 1, 'admin.role.view': 1 } }

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
    const store = useAuthStore()
    store.user = { id: 1, roles: [], permissions: {} }

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
