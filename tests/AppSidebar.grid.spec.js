import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const pushMock = vi.fn()
const replaceMock = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: pushMock, replace: replaceMock }),
  useRoute: () => ({ path: '/' })
}))

import AppSidebar from '@/shared/components/AppSidebar.vue'

describe('AppSidebar (root route)', () => {
  beforeEach(() => {
    pushMock.mockClear()
    replaceMock.mockClear()
  })

  it('navigates to Dashboard by name when clicking grid', async () => {
    const wrapper = mount(AppSidebar)

    const btns = wrapper.findAll('button')
    const gridBtn = btns.find(b => b.find('i.pi.pi-th-large').exists())
    expect(gridBtn).toBeTruthy()
    await gridBtn.trigger('click')

    expect(pushMock).toHaveBeenCalled()
    expect(pushMock.mock.calls[0][0]).toEqual({ name: 'Dashboard' })
  })
})
