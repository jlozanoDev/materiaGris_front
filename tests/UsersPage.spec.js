import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import UsersPage from '@/modules/admin/users/presentation/pages/UsersPage.vue'
import { ref } from 'vue'

vi.mock('@/core/store/auth', () => ({
  useAuthStore: () => ({
    user: { id: 1, permissions: { 'admin.user.view': 1, 'admin.user.create': 1, 'admin.user.update': 1 } },
    hasPermission: (p) => true,
    hasPermissions: (p) => true,
    fetchUser: vi.fn()
  })
}))

// Define shared mock data at top level to avoid hoisting issues
const mockUsers = ref([])
const mockLoading = ref(false)
const mockCreateUser = vi.fn()
const mockUpdateUser = vi.fn()
const mockDeleteUser = vi.fn()
const mockFetchUsers = vi.fn()

vi.mock('@/modules/admin/users/presentation/composables/useUsers', () => ({
  useUsers: () => ({
    users: mockUsers,
    loading: mockLoading,
    fetchUsers: mockFetchUsers,
    createUser: mockCreateUser,
    updateUser: mockUpdateUser,
    deleteUser: mockDeleteUser
  })
}))

describe('UsersPage (integration front)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUsers.value = []
    mockLoading.value = false
  })

  it('calls createUser when saveUser is called in creation mode', async () => {
    mockCreateUser.mockResolvedValue({ id: 123, name: 'Created', email: 'c@example.com' })

    const wrapper = mount(UsersPage, {
      global: {
        stubs: ['AppSidebar', 'TopBar', 'Breadcrumb', 'Modal', 'UiVuetifyDataTable']
      }
    })

    const vm = wrapper.vm
    vm.form = { name: 'Created', email: 'c@example.com' }
    vm.isNewUser = true

    // Call the method directly
    await vm.saveUser()
    await flushPromises()

    expect(mockCreateUser).toHaveBeenCalledWith({ name: 'Created', email: 'c@example.com' })
  })

  it('calls updateUser when saveUser is called in edit mode', async () => {
    mockUpdateUser.mockResolvedValue({ id: 5, name: 'New' })

    const wrapper = mount(UsersPage, {
      global: { 
        stubs: ['AppSidebar', 'TopBar', 'Breadcrumb', 'Modal', 'UiVuetifyDataTable']
      }
    })

    const vm = wrapper.vm
    vm.form = { id: 5, name: 'New' }
    vm.isNewUser = false

    // Call the method directly
    await vm.saveUser()
    await flushPromises()

    expect(mockUpdateUser).toHaveBeenCalledWith(5, { name: 'New' })
  })
})
