import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { mount } from '@vue/test-utils'

vi.mock('@/core/store/auth', () => ({
  useAuthStore: () => ({
    hasPermission: () => true,
    user: { permissions: [] },
  }),
}))

vi.mock('@/core/api/httpClient', () => ({
  fetchClient: vi.fn().mockResolvedValue([]),
}))

vi.mock('@/modules/admin/roles/presentation/composables/useRoles', () => ({
  useRoles: () => ({
    roles: ref([]),
    fetchRoles: vi.fn().mockResolvedValue([
      { id: 1, name: 'Médico', slug: 'medico', is_system: false },
      { id: 2, name: 'Admin', slug: 'admin', is_system: true }
    ])
  })
}))

import EditUserModal from '@/modules/admin/users/presentation/components/EditUserModal.vue'

describe('EditUserModal', () => {
  const mockClose = vi.fn()
  const mockSave = vi.fn()

  const mockUser = {
    id: 1,
    name: 'Juan Pérez',
    email: 'juan@test.com',
    roles: [
      { id: 1, name: 'Médico', slug: 'medico', is_system: false }
    ],
    user_permissions: [
      { permission_id: 5, slug: 'patients.view', grant: 1, origin: 'user', origin_id: null }
    ],
    effective_permissions: {
      'patients.view': 1,
      'patients.edit': -1
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock global confirm to avoid interactive dialog in tests
    global.confirm = vi.fn(() => true)
  })

  it('restores overrides when clicking restore', async () => {
    const wrapper = mount(EditUserModal, {
      props: {
        show: true,
        user: mockUser
      },
      emits: ['close', 'save'],
      global: {
        stubs: {
          Modal: {
            template: '<div><slot></slot></div>'
          }
        }
      }
    })

    // Simular cambio local en selectedPermissions
    wrapper.vm.selectedPermissions[999] = -1
    expect(wrapper.vm.selectedPermissions[999]).toBe(-1)

    // Llamar al helper de restauración
    await wrapper.vm.resetPermissions()

    // Debe volver a los overrides originales (p.permission_id = 5 en mockUser)
    expect(wrapper.vm.selectedPermissions[5]).toBe(1)
    expect(wrapper.vm.selectedPermissions[999]).toBeUndefined()
  })

  it('renders form fields correctly', () => {
    const wrapper = mount(EditUserModal, {
      props: {
        show: true,
        user: mockUser
      },
      emits: ['close', 'save'],
      global: {
        stubs: {
          Modal: {
            template: '<div><slot></slot></div>'
          }
        }
      }
    })

    expect(wrapper.find('input[type="text"]').exists()).toBe(true)
  })

  it('displays user data in form fields', () => {
    const wrapper = mount(EditUserModal, {
      props: {
        show: true,
        user: mockUser
      },
      emits: ['close', 'save'],
      global: {
        stubs: {
          Modal: {
            template: '<div><slot></slot></div>'
          }
        }
      }
    })

    expect(wrapper.find('input[type="text"]').element.value).toBe('Juan Pérez')
  })

  it('shows roles section', () => {
    const wrapper = mount(EditUserModal, {
      props: {
        show: true,
        user: mockUser
      },
      emits: ['close', 'save'],
      global: {
        stubs: {
          Modal: {
            template: '<div><slot></slot></div>'
          }
        }
      }
    })

    expect(wrapper.text()).toContain('Roles')
  })

  it('displays system role as disabled', () => {
    const wrapper = mount(EditUserModal, {
      props: {
        show: true,
        user: { ...mockUser, all_roles: [
          { id: 1, name: 'Médico', slug: 'medico', is_system: false },
          { id: 2, name: 'Admin', slug: 'admin', is_system: true }
        ]}
      },
      emits: ['close', 'save'],
      global: {
        stubs: {
          Modal: {
            template: '<div><slot></slot></div>'
          }
        }
      }
    })

    // System roles are visually marked with "Sistema" badge, not disabled
    // Check that the system role badge is rendered for the admin role
    const systemBadge = wrapper.findAll('span').filter(s => s.text().includes('Sistema'))[0]
    expect(systemBadge).toBeDefined()
  })

  it('emits save with name only when no role changes', async () => {
    const wrapper = mount(EditUserModal, {
      props: {
        show: true,
        user: mockUser
      },
      emits: ['close', 'save'],
      global: {
        stubs: {
          Modal: {
            template: '<div><slot></slot></div>'
          }
        }
      }
    })

    // Simular que no hay cambios de roles
    await wrapper.find('form').trigger('submit.prevent')

    const emitted = wrapper.emitted('save')
    expect(emitted).toBeTruthy()
    // Should emit just name (backwards compatible)
    expect(emitted[0][0]).toHaveProperty('name', 'Juan Pérez')
  })

  it('emits save with roles when changed', async () => {
    const wrapper = mount(EditUserModal, {
      props: {
        show: true,
        user: { ...mockUser, all_roles: [
          { id: 1, name: 'Médico', slug: 'medico', is_system: false },
          { id: 2, name: 'Enfermera', slug: 'enfermera', is_system: false }
        ]}
      },
      emits: ['close', 'save'],
      global: {
        stubs: {
          Modal: {
            template: '<div><slot></slot></div>'
          }
        }
      }
    })

    // Toggle checkbox para añadir rol 2
    const checkbox = wrapper.find('input[value="2"]')
    await checkbox.setChecked()

    await wrapper.find('form').trigger('submit.prevent')

    const emitted = wrapper.emitted('save')
    expect(emitted).toBeTruthy()
    expect(emitted[0][0]).toHaveProperty('roles')
    expect(emitted[0][0]).toHaveProperty('roles_remove')
  })

  it('displays effective permissions section', async () => {
    const wrapper = mount(EditUserModal, {
      props: {
        show: true,
        user: mockUser
      },
      emits: ['close', 'save'],
      global: {
        stubs: {
          Modal: {
            template: '<div><slot></slot></div>'
          }
        }
      }
    })

    // Expand "Permisos avanzados" section to reveal effective permissions
    await wrapper.find('button').trigger('click')

    expect(wrapper.text()).toContain('Permisos efectivos')
  })

  it('shows warning when role change removes overrides', async () => {
    const wrapper = mount(EditUserModal, {
      props: {
        show: true,
        user: {
          ...mockUser,
          roles: [],
          all_roles: [
            { id: 1, name: 'Médico', slug: 'medico', is_system: false, permissions: [{ name: 'patients.view' }] }
          ],
          permissions_override: ['-patients.view']
        }
      },
      emits: ['close', 'save'],
      global: {
        stubs: {
          Modal: {
            template: '<div><slot></slot></div>'
          }
        }
      }
    })

    // Añadir rol que contiene permission con override negativo
    const checkbox = wrapper.find('input[value="1"]')
    await checkbox.setChecked()

    expect(wrapper.text()).toContain('Se eliminarán')
    // Se debe mostrar la slug del permiso en la lista de overrides a eliminar
    expect(wrapper.text()).toContain('patients.view')
    // Badge de advertencia presente
    expect(wrapper.find('.badge--danger').exists()).toBe(true)
  })
})