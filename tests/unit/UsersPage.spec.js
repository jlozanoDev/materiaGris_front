import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import vHasPermission from '@/shared/directives/v-has-permission'

vi.mock('@/modules/admin/users/presentation/composables/useUsers', () => {
  const { ref } = require('vue')
  return {
    useUsers: () => ({
      users: ref([{ id: 1, name: 'Alice', email: 'alice@example.com', role: { name: 'Admin' }, active: true }]),
      loading: ref(false),
      fetchUsers: vi.fn(),
    }),
  }
})

vi.mock('@/core/store/auth', () => {
  const { ref } = require('vue')
  return {
    useAuthStore: () => ({
      user: ref({ id: 1, roles: ['admin'], permissions: { 'admin.user.view': 1 } }),
      fetchUser: vi.fn().mockResolvedValue({ id: 1 }),
      hasPermission: (slug) => slug === 'admin.user.view',
    }),
  }
})

import UsersPage from '@/modules/admin/users/presentation/pages/UsersPage.vue'

describe('UsersPage', () => {
  it('renders users from composable', async () => {
    const wrapper = mount(UsersPage, {
      global: {
        directives: { 'has-permission': vHasPermission },
        stubs: {
          AppSidebar: true,
          TopBar: true,
          Breadcrumb: true,
          Modal: true,
          UiVuetifyDataTable: {
            props: ['value'],
            template: '<div class="users-table"><slot name="body-actions" :data="value && value[0]"> </slot><div class="rows">{{ value && value[0] && value[0].name }} - {{ value && value[0] && value[0].email }}</div></div>',
          },
        },
      },
    })

    await wrapper.vm.$nextTick()
    expect(wrapper.html()).toContain('Alice')
    expect(wrapper.html()).toContain('alice@example.com')
  })
})
