import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AppSidebar from '@/shared/components/AppSidebar.vue'
import vHasPermission from '@/shared/directives/v-has-permission'
import { useAuthStore } from '@/core/store/auth'

const pushMock = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: pushMock }),
  useRoute: () => ({ path: '/' })
}))

describe('AppSidebar Permissions', () => {
  beforeEach(() => {
    pushMock.mockClear()
  })

  it('hides patients menu item when patient.view permission is missing', async () => {
    const store = useAuthStore()
    // User with no permissions
    store.user = { id: 1, roles: [], permissions: {} }

    const wrapper = mount(AppSidebar, {
      global: {
        directives: { 'has-permission': vHasPermission },
      },
    })

    await wrapper.vm.$nextTick()
    
    // Check for patients icon (pi-users)
    const patientsBtn = wrapper.find('button[title="Pacientes"]')
    expect(patientsBtn.exists()).toBe(true)
    expect(patientsBtn.element.style.display).toBe('none')
  })

  it('shows patients menu item when patient.view permission is present', async () => {
    const store = useAuthStore()
    // User with patient.view permission
    store.user = { id: 1, roles: [], permissions: { 'patient.view': 1 } }

    const wrapper = mount(AppSidebar, {
      global: {
        directives: { 'has-permission': vHasPermission },
      },
    })

    await wrapper.vm.$nextTick()
    
    const patientsBtn = wrapper.find('button[title="Pacientes"]')
    expect(patientsBtn.exists()).toBe(true)
    // Ensure the button is visible when the user has the permission
    expect(patientsBtn.isVisible()).toBe(true)
  })
})
