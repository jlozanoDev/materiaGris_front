import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HeroCard from '@/modules/dashboard/presentation/components/HeroCard.vue'

describe('HeroCard', () => {
  it('muestra "Usuario" cuando no hay user', () => {
    const wrapper = mount(HeroCard, { props: { user: null } })
    expect(wrapper.text()).toContain('Usuario!')
  })

  it('muestra el nombre del usuario', () => {
    const wrapper = mount(HeroCard, { props: { user: { name: 'Ana' } } })
    expect(wrapper.text()).toContain('Ana!')
  })

  it('usa el email si no hay nombre', () => {
    const wrapper = mount(HeroCard, { props: { user: { email: 'ana@test.com' } } })
    expect(wrapper.text()).toContain('ana@test.com!')
  })

  it('el nombre tiene prioridad sobre el email', () => {
    const wrapper = mount(HeroCard, { props: { user: { name: 'Luis', email: 'luis@test.com' } } })
    expect(wrapper.text()).toContain('Luis!')
    expect(wrapper.text()).not.toContain('luis@test.com!')
  })

  it('muestra las estadísticas de visitas', () => {
    const wrapper = mount(HeroCard)
    expect(wrapper.text()).toContain('104')
    expect(wrapper.text()).toContain('Visitas hoy')
    expect(wrapper.text()).toContain('Nuevos pacientes')
    expect(wrapper.text()).toContain('Pacientes antiguos')
  })

  it('usa user prop por defecto como null', () => {
    const wrapper = mount(HeroCard)
    expect(wrapper.text()).toContain('Usuario!')
  })
})
