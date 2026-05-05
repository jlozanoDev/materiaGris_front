import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import vHasPermission from '@/shared/directives/v-has-permission'
import { useAuthStore } from '@/core/store/auth'

const TestComp = {
  template: `<div><button id="btn" v-has-permission="'admin.user.view'">Btn</button></div>`,
}

describe('v-has-permission directive', () => {
  it('hides element when user lacks permission', async () => {
    const store = useAuthStore()
    store.user = { id: 1, roles: [], permissions: {} }

    const wrapper = mount(TestComp, {
      global: {
        directives: { 'has-permission': vHasPermission },
      },
    })

    await wrapper.vm.$nextTick()
    const btn = wrapper.find('#btn')
    expect(btn.exists()).toBe(true)
    expect(btn.element.style.display).toBe('none')
  })

  it('keeps element visible when user has permission', async () => {
    const store = useAuthStore()
    store.user = { id: 1, roles: ['admin'], permissions: { 'admin.user.view': 1 } }

    const wrapper = mount(TestComp, {
      global: {
        directives: { 'has-permission': vHasPermission },
      },
    })

    await wrapper.vm.$nextTick()
    const btn = wrapper.find('#btn')
    expect(btn.exists()).toBe(true)
    expect(btn.element.style.display).not.toBe('none')
  })
})
