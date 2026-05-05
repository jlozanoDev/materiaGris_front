import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import ToggleSwitch from '@/shared/components/ToggleSwitch.vue'

describe('ToggleSwitch', () => {
  it('renderiza con valor por defecto false y emite toggle al hacer click', async () => {
    const wrapper = mount(ToggleSwitch, { props: { modelValue: false } })

    expect(wrapper.attributes('aria-pressed')).toBe('false')
    expect(wrapper.classes()).toContain('toggle')

    // Find the button and trigger click
    const btn = wrapper.find('button')
    await btn.trigger('click')

    const emitted = wrapper.emitted()
    expect(emitted['update:modelValue']).toBeDefined()
    expect(emitted['update:modelValue'][0]).toEqual([true])
  })

  it('no emite cuando está deshabilitado', async () => {
    const wrapper = mount(ToggleSwitch, { props: { modelValue: false, disabled: true } })

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.attributes('aria-pressed')).toBe('false')
  })

  it('muestra estado true correctamente', () => {
    const wrapper = mount(ToggleSwitch, { props: { modelValue: true } })

    expect(wrapper.attributes('aria-pressed')).toBe('true')
    expect(wrapper.classes()).toContain('toggle--on')
  })
})
