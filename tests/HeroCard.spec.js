import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HeroCard from '@/modules/dashboard/presentation/components/HeroCard.vue'

describe('HeroCard', () => {
  it('muestra "Usuario" por defecto cuando no hay userName', () => {
    const wrapper = mount(HeroCard)
    expect(wrapper.text()).toContain('Usuario!')
  })

  it('muestra el nombre del usuario con prop userName', () => {
    const wrapper = mount(HeroCard, { props: { userName: 'Ana' } })
    expect(wrapper.text()).toContain('Ana!')
  })

  it('muestra skeleton cuando loading es true', () => {
    const wrapper = mount(HeroCard, { props: { loading: true } })
    expect(wrapper.find('.animate-pulse').exists()).toBe(true)
    expect(wrapper.text()).not.toContain('Visitas hoy')
  })

  it('muestra error badge cuando hay error', () => {
    const wrapper = mount(HeroCard, { props: { error: 'Error de conexión' } })
    expect(wrapper.text()).toContain('Error de conexión')
  })

  it('muestra las estadísticas de visitas con datos', () => {
    const wrapper = mount(HeroCard, {
      props: {
        stats: { visits: 104, newPatients: 40, returningPatients: 64 },
      },
    })
    expect(wrapper.text()).toContain('104')
    expect(wrapper.text()).toContain('Visitas hoy')
    expect(wrapper.text()).toContain('40')
    expect(wrapper.text()).toContain('64')
    expect(wrapper.text()).toContain('Nuevos pacientes')
    expect(wrapper.text()).toContain('Pacientes antiguos')
  })

  it('muestra "Usuario" por defecto sin prop', () => {
    const wrapper = mount(HeroCard)
    expect(wrapper.text()).toContain('Usuario!')
  })

  it('muestra onboarding para nuevo profesional cuando isEmptyState y isNewProfessional', () => {
    const wrapper = mount(HeroCard, {
      props: {
        stats: { visits: 0, newPatients: 0, returningPatients: 0, totalPatients: 0 },
        loading: false,
        isEmptyState: true,
        isNewProfessional: true,
      },
    })
    expect(wrapper.text()).toContain('Comienza a construir')
    expect(wrapper.text()).toContain('Registra tu primer paciente')
    expect(wrapper.text()).not.toContain('Visitas hoy')
  })

  it('muestra mensaje de día lento cuando isEmptyState y !isNewProfessional', () => {
    const wrapper = mount(HeroCard, {
      props: {
        stats: { visits: 0, newPatients: 0, returningPatients: 0, totalPatients: 12 },
        loading: false,
        isEmptyState: true,
        isNewProfessional: false,
      },
    })
    expect(wrapper.text()).toContain('Hoy no hay actividad')
    expect(wrapper.text()).toContain('12')
    expect(wrapper.text()).not.toContain('Visitas hoy')
  })
})
