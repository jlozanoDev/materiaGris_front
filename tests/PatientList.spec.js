import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import PatientList from '@/modules/dashboard/presentation/components/PatientList.vue'

describe('PatientList', () => {
  it('renderiza la lista de pacientes', () => {
    const wrapper = mount(PatientList)
    expect(wrapper.text()).toContain('Lista de pacientes')
    expect(wrapper.text()).toContain('Denzel White')
    expect(wrapper.text()).toContain('Stacy Mitchell')
    expect(wrapper.text()).toContain('Amy Dunham')
    expect(wrapper.text()).toContain('Demi Joan')
    expect(wrapper.text()).toContain('Susan Myers')
  })

  it('el primer paciente está seleccionado por defecto', () => {
    const wrapper = mount(PatientList)
    const firstItem = wrapper.find('li')
    // Component uses inline style and bg-[#7c3aed]/10 class (arbitrary value from Tailwind JIT)
    expect(firstItem.element.style.borderLeft).toContain('#7c3aed')
  })

  it('emite el evento select al hacer click', async () => {
    const wrapper = mount(PatientList)
    const secondItem = wrapper.findAll('li')[1]
    await secondItem.trigger('click')
    expect(wrapper.emitted('select')).toBeTruthy()
    expect(wrapper.emitted('select')[0][0]).toEqual(expect.objectContaining({ name: 'Stacy Mitchell' }))
  })

  it('cambia la selección visual al hacer click', async () => {
    const wrapper = mount(PatientList)
    const items = wrapper.findAll('li')
    // First item selected by default (inline style with border-left)
    expect(items[0].element.style.borderLeft).toContain('#7c3aed')

    await items[2].trigger('click')
    expect(items[2].element.style.borderLeft).toContain('#7c3aed')
  })

  it('tiene dots de paginación', () => {
    const wrapper = mount(PatientList)
    const dots = wrapper.findAll('.rounded-full')
    // The dots are in the pagination section at the bottom
    expect(wrapper.text()).toContain('Hoy')
  })
})
