import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import RolePermissionsEditor from '@/modules/admin/roles/presentation/components/RolePermissionsEditor.vue'

describe('RolePermissionsEditor', () => {
  const availablePermissions = [
    { id: 1, name: 'Permiso 1', category: 'Cat 1', description: 'Desc 1' },
    { id: 2, name: 'Permiso 2', category: 'Cat 1', description: 'Desc 2' }
  ]

  it('renderiza todas las categorías y permisos', () => {
    const wrapper = mount(RolePermissionsEditor, {
      props: { availablePermissions, modelValue: [] }
    })

    expect(wrapper.text()).toContain('Cat 1')
    expect(wrapper.text()).toContain('Permiso 1')
    expect(wrapper.text()).toContain('Permiso 2')
  })

  it('emite el grant correcto al hacer clic en permitir', async () => {
    const wrapper = mount(RolePermissionsEditor, {
      props: { availablePermissions, modelValue: [] }
    })

    // Buscar botones de "Permitir" (el primero)
    const permitBtn = wrapper.findAll('button').filter(b => b.text().includes('Permitir'))[0]
    await permitBtn.trigger('click')

    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toBeDefined()
    expect(emitted[0][0]).toEqual([{ id: 1, grant: 1 }])
  })

  it('emite el grant correcto al hacer clic en denegar', async () => {
    const wrapper = mount(RolePermissionsEditor, {
      props: { availablePermissions, modelValue: [] }
    })

    const denyBtn = wrapper.findAll('button').filter(b => b.text().includes('Denegar'))[0]
    await denyBtn.trigger('click')

    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted[0][0]).toEqual([{ id: 1, grant: -1 }])
  })

  it('elimina el permiso del array al ponerlo en neutral', async () => {
    const wrapper = mount(RolePermissionsEditor, {
      props: { 
        availablePermissions, 
        modelValue: [{ id: 1, grant: 1 }] 
      }
    })

    const neutralBtn = wrapper.findAll('button').filter(b => b.text().includes('Neutral'))[0]
    await neutralBtn.trigger('click')

    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted[0][0]).toEqual([])
  })
})
