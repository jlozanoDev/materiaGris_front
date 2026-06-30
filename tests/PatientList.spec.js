import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PatientList from '@/modules/dashboard/presentation/components/PatientList.vue'

const MOCK_PATIENTS = [
  { id: 1, name: 'Denzel White', visitTime: '9:00', initials: 'DW' },
  { id: 2, name: 'Stacy Mitchell', visitTime: '9:15', initials: 'SM' },
  { id: 3, name: 'Amy Dunham', visitTime: '9:30', initials: 'AD' },
  { id: 4, name: 'Demi Joan', visitTime: '9:50', initials: 'DJ' },
  { id: 5, name: 'Susan Myers', visitTime: '10:15', initials: 'SM' },
]

describe('PatientList', () => {
  it('renderiza la lista de pacientes', () => {
    const wrapper = mount(PatientList, {
      props: { patients: MOCK_PATIENTS },
    })
    expect(wrapper.text()).toContain('Lista de pacientes')
    expect(wrapper.text()).toContain('Denzel White')
    expect(wrapper.text()).toContain('Stacy Mitchell')
    expect(wrapper.text()).toContain('Amy Dunham')
    expect(wrapper.text()).toContain('Demi Joan')
    expect(wrapper.text()).toContain('Susan Myers')
  })

  it('muestra skeleton cuando loading es true', () => {
    const wrapper = mount(PatientList, {
      props: { loading: true },
    })
    expect(wrapper.findAll('.animate-pulse').length).toBeGreaterThanOrEqual(5)
  })

  it('muestra empty state cuando no hay pacientes', () => {
    const wrapper = mount(PatientList, {
      props: { patients: [] },
    })
    expect(wrapper.text()).toContain('No hay pacientes hoy')
  })

  it('emite el evento select con el id del paciente al hacer click', async () => {
    const wrapper = mount(PatientList, {
      props: { patients: MOCK_PATIENTS },
    })
    const secondItem = wrapper.findAll('li')[1]
    await secondItem.trigger('click')
    expect(wrapper.emitted('select')).toBeTruthy()
    expect(wrapper.emitted('select')[0][0]).toBe(2)
  })

  it('tiene dots de paginación', () => {
    const wrapper = mount(PatientList, {
      props: { patients: MOCK_PATIENTS },
    })
    expect(wrapper.text()).toContain('Hoy')
  })
})
