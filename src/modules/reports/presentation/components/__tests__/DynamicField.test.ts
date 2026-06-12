import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DynamicField from '../DynamicField.vue'
import type { FieldConfig } from '@/shared/types'

function createField(overrides: Partial<FieldConfig> = {}): FieldConfig {
  return {
    id: 'f1',
    type: 'text',
    label: 'Test Field',
    key: 'test_field',
    required: false,
    ...overrides,
  }
}

describe('DynamicField', () => {
  it('renders text input for type=text', () => {
    const field = createField({ type: 'text', placeholder: 'Escriba aquí' })
    const wrapper = mount(DynamicField, {
      props: { field, modelValue: '', disabled: false },
    })
    const input = wrapper.find('input[type="text"]')
    expect(input.exists()).toBe(true)
    expect(input.attributes('placeholder')).toBe('Escriba aquí')
  })

  it('renders textarea for type=textarea', () => {
    const field = createField({ type: 'textarea' })
    const wrapper = mount(DynamicField, {
      props: { field, modelValue: '', disabled: false },
    })
    expect(wrapper.find('textarea').exists()).toBe(true)
  })

  it('renders date input for type=date', () => {
    const field = createField({ type: 'date' })
    const wrapper = mount(DynamicField, {
      props: { field, modelValue: '', disabled: false },
    })
    expect(wrapper.find('input[type="date"]').exists()).toBe(true)
  })

  it('renders select for type=select', () => {
    const field = createField({
      type: 'select',
      options: [
        { label: 'Opción A', value: 'a' },
        { label: 'Opción B', value: 'b' },
      ],
    })
    const wrapper = mount(DynamicField, {
      props: { field, modelValue: '', disabled: false },
    })
    const select = wrapper.find('select')
    expect(select.exists()).toBe(true)
    const options = select.findAll('option')
    // 3 options: placeholder + 2 actual
    expect(options).toHaveLength(3)
    expect(options[1].text()).toBe('Opción A')
    expect(options[2].text()).toBe('Opción B')
  })

  it('renders radio group for type=radio', () => {
    const field = createField({
      type: 'radio',
      options: [
        { label: 'Sí', value: 'si' },
        { label: 'No', value: 'no' },
      ],
    })
    const wrapper = mount(DynamicField, {
      props: { field, modelValue: '', disabled: false },
    })
    const radios = wrapper.findAll('input[type="radio"]')
    expect(radios).toHaveLength(2)
    expect(wrapper.text()).toContain('Sí')
    expect(wrapper.text()).toContain('No')
  })

  it('renders checkbox group for type=checkbox', () => {
    const field = createField({
      type: 'checkbox',
      options: [
        { label: 'Opción 1', value: '1' },
        { label: 'Opción 2', value: '2' },
      ],
    })
    const wrapper = mount(DynamicField, {
      props: { field, modelValue: [], disabled: false },
    })
    const checkboxes = wrapper.findAll('input[type="checkbox"]')
    expect(checkboxes).toHaveLength(2)
    expect(wrapper.text()).toContain('Opción 1')
    expect(wrapper.text()).toContain('Opción 2')
  })

  it('renders number input for type=number', () => {
    const field = createField({ type: 'number', placeholder: '0' })
    const wrapper = mount(DynamicField, {
      props: { field, modelValue: 0, disabled: false },
    })
    const input = wrapper.find('input[type="number"]')
    expect(input.exists()).toBe(true)
    expect(input.attributes('placeholder')).toBe('0')
  })

  it('renders DynamicTable for type=dynamic_table', () => {
    const field = createField({
      type: 'dynamic_table',
      columns: [
        { name: 'Medicamento', type: 'text' },
        { name: 'Dosis', type: 'text' },
      ],
    })
    const wrapper = mount(DynamicField, {
      props: { field, modelValue: [], disabled: false },
    })
    // Should contain "Añadir fila" button
    expect(wrapper.text()).toContain('Añadir fila')
  })

  it('renders SignaturePad for type=signature', () => {
    const field = createField({ type: 'signature' })
    const wrapper = mount(DynamicField, {
      props: { field, modelValue: null, disabled: false },
    })
    // Should contain the watermark text
    expect(wrapper.text()).toContain('Firme dentro del recuadro')
  })

  it('shows placeholder for unknown type', () => {
    const field = createField({ type: 'text' as any })
    // Force an unknown type by setting a type that's not handled
    const wrapper = mount(DynamicField, {
      props: { field: { ...field, type: 'unknown_type' as any }, modelValue: '', disabled: false },
    })
    expect(wrapper.text()).toContain('no soportado')
  })

  it('emits update:modelValue on text input', async () => {
    const field = createField({ type: 'text' })
    const wrapper = mount(DynamicField, {
      props: { field, modelValue: '', disabled: false },
    })
    const input = wrapper.find('input[type="text"]')
    await input.setValue('nuevo valor')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['nuevo valor'])
  })

  it('renders as disabled when disabled prop is true', () => {
    const field = createField({ type: 'text' })
    const wrapper = mount(DynamicField, {
      props: { field, modelValue: '', disabled: true },
    })
    const input = wrapper.find('input[type="text"]')
    expect(input.attributes('disabled')).toBeDefined()
  })
})
