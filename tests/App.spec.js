import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'

// Mock useToast before importing App
vi.mock('@/shared/composables/useToast', () => ({
  useToast: vi.fn(() => ({
    toasts: [],
    show: vi.fn(),
    remove: vi.fn(),
  })),
}))

// Mock Toast component
vi.mock('@/shared/components/Toast.vue', () => ({
  default: {
    name: 'Toast',
    props: ['id', 'message', 'type'],
    template: '<div class="toast">{{ message }}</div>',
  },
}))

import App from '@/App.vue'

describe('App.vue', () => {
  it('mounts successfully', () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          'router-view': { template: '<div class="router-view-stub" />' },
          'transition-group': { template: '<div><slot /></div>' },
        },
      },
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'App' }).exists()).toBe(true)
  })

  it('contains router-view', () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          'router-view': { template: '<div class="router-view-stub" />' },
          'transition-group': { template: '<div><slot /></div>' },
        },
      },
    })

    expect(wrapper.find('.router-view-stub').exists()).toBe(true)
  })

  it('has aria-live region for toasts', () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          'router-view': { template: '<div />' },
          'transition-group': { template: '<div><slot /></div>' },
        },
      },
    })

    expect(wrapper.find('[aria-live="polite"]').exists()).toBe(true)
  })
})
