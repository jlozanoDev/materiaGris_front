import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const pushMock = vi.fn()
const replaceMock = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: pushMock, replace: replaceMock }),
  useRoute: () => ({ path: '/admin/users' })
}))

import AppSidebar from '@/shared/components/AppSidebar.vue'

describe('AppSidebar (admin route)', () => {
  beforeEach(() => {
    pushMock.mockClear()
    replaceMock.mockClear()
  })

  it('marks settings active when route is /admin/users', async () => {
    const wrapper = mount(AppSidebar)

    const settingsIcon = wrapper.find('i.pi.pi-cog')
    expect(settingsIcon.exists()).toBe(true)
    const settingsBtnEl = settingsIcon.element.closest('button')
    expect(settingsBtnEl).not.toBeNull()
    // wait for any state updates from onMounted to reflect in DOM
    await wrapper.vm.$nextTick()
    expect(settingsBtnEl.classList.contains('sidebar-item--active')).toBe(true)
  })
})
