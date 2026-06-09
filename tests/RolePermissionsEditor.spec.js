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

  it('toggle entre permitir y neutral', async () => {
    // Component only has Permitir/Permitido toggle (no Denegar/Neutral buttons)
    const wrapper = mount(RolePermissionsEditor, {
      props: { availablePermissions, modelValue: [] }
    })

    // Click "Permitir" for first permission → should emit grant 1
    const permitBtn = wrapper.findAll('button').filter(b => b.text().includes('Permitir'))[0]
    await permitBtn.trigger('click')

    let emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toBeDefined()
    expect(emitted[0][0]).toEqual([{ id: 1, grant: 1 }])

    // Update modelValue prop to reflect emitted change so button shows "Permitido"
    await wrapper.setProps({ modelValue: [{ id: 1, grant: 1 }] })

    // Click "Permitido" → toggles back to neutral (removes from array)
    const permittedBtn = wrapper.findAll('button').filter(b => b.text().includes('Permitido'))[0]
    await permittedBtn.trigger('click')

    emitted = wrapper.emitted('update:modelValue')
    expect(emitted[1][0]).toEqual([])
  })
})
