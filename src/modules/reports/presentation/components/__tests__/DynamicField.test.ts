import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DynamicField from '../DynamicField.vue'
import type { FieldConfig } from '@/shared/types'

function createField(overrides: Record<string, any> = {}): FieldConfig {
  return {
    id: 'f1',
    type: 'text',
    label: 'Test Field',
    key: 'test_field',
    required: false,
    ...overrides,
  } as FieldConfig
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
    // CustomSelect renders a button trigger with aria-haspopup
    const trigger = wrapper.find('button[aria-haspopup="listbox"]')
    expect(trigger.exists()).toBe(true)
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
    const field = createField({ type: 'number' })
    const wrapper = mount(DynamicField, {
      props: { field, modelValue: 0, disabled: false },
    })
    const input = wrapper.find('input[type="number"]')
    expect(input.exists()).toBe(true)
  })

  it('renders DynamicTable for type=dynamic_table', () => {
    const field = createField({
      type: 'dynamic_table',
      columns: [
        { key: 'medicamento', label: 'Medicamento', type: 'text', required: false },
        { key: 'dosis', label: 'Dosis', type: 'text', required: false },
      ],
    })
    const wrapper = mount(DynamicField, {
      props: { field, modelValue: [], disabled: false },
    })
    // Should contain "Añadir fila" button
    expect(wrapper.text()).toContain('Añadir fila')
  })

  it('renders FixedTextRenderer for type=fixed_text', () => {
    const field = createField({
      type: 'fixed_text',
      text_content: 'Hello {paciente.nombre}',
    } as any)
    const wrapper = mount(DynamicField, {
      props: { field, modelValue: null, disabled: false },
    })
    expect(wrapper.find('.fixed-text-renderer').exists()).toBe(true)
  })

  it('forwards variableResolver to FixedTextRenderer for fixed_text type', () => {
    const resolver = (t: string) => t.replace(/\{x\}/g, 'Y')
    const field = createField({
      type: 'fixed_text',
      text_content: '{x} World',
    } as any)
    const wrapper = mount(DynamicField, {
      props: { field, modelValue: null, disabled: false, variableResolver: resolver },
    })
    expect(wrapper.find('.fixed-text-renderer').exists()).toBe(true)
    expect(wrapper.html()).toContain('Y World')
    expect(wrapper.html()).not.toContain('{x}')
  })

  it('forwards variableResolver to FixedTextRenderer in disabled mode', () => {
    const resolver = (t: string) => t.replace(/\{y\}/g, 'Z')
    const field = createField({
      type: 'fixed_text',
      text_content: '{y} Disabled',
    } as any)
    const wrapper = mount(DynamicField, {
      props: { field, modelValue: null, disabled: true, variableResolver: resolver },
    })
    expect(wrapper.find('.fixed-text-renderer').exists()).toBe(true)
    expect(wrapper.html()).toContain('Z Disabled')
    expect(wrapper.html()).not.toContain('{y}')
  })

  it('renders literal text when no variableResolver is provided', () => {
    const field = createField({
      type: 'fixed_text',
      text_content: '{foo} literal',
    } as any)
    const wrapper = mount(DynamicField, {
      props: { field, modelValue: null, disabled: false },
    })
    expect(wrapper.html()).toContain('{foo} literal')
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
      props: { field, modelValue: 'Hola', disabled: true },
    })
    const input = wrapper.find('input[type="text"]')
    expect(input.exists()).toBe(false)
    const span = wrapper.find('.dynamic-field__readonly')
    expect(span.exists()).toBe(true)
    expect(span.text()).toBe('Hola')
  })

  it('renders date field as formatted span when disabled', () => {
    const field = createField({ type: 'date' })
    const wrapper = mount(DynamicField, {
      props: { field, modelValue: '2026-06-19', disabled: true },
    })
    expect(wrapper.find('input[type="date"]').exists()).toBe(false)
    const span = wrapper.find('.dynamic-field__readonly')
    expect(span.exists()).toBe(true)
    expect(span.text()).toBe('19/06/2026')
  })

  it('renders select field as label span when disabled', () => {
    const field = createField({
      type: 'select',
      options: [
        { label: 'Masculino', value: 'm' },
        { label: 'Femenino', value: 'f' },
      ],
    })
    const wrapper = mount(DynamicField, {
      props: { field, modelValue: 'm', disabled: true },
    })
    expect(wrapper.find('button[aria-haspopup="listbox"]').exists()).toBe(false)
    const span = wrapper.find('.dynamic-field__readonly')
    expect(span.exists()).toBe(true)
    expect(span.text()).toBe('Masculino')
  })

  it('renders multi_select field as comma-separated labels when disabled', () => {
    const field = createField({
      type: 'multi_select',
      options: [
        { label: 'Opción A', value: 'a' },
        { label: 'Opción B', value: 'b' },
        { label: 'Opción C', value: 'c' },
      ],
    })
    const wrapper = mount(DynamicField, {
      props: { field, modelValue: ['a', 'c'], disabled: true },
    })
    expect(wrapper.find('select').exists()).toBe(false)
    const span = wrapper.find('.dynamic-field__readonly')
    expect(span.exists()).toBe(true)
    expect(span.text()).toBe('Opción A, Opción C')
  })

  it('renders em-dash for empty value when disabled', () => {
    const field = createField({ type: 'text' })
    const wrapper = mount(DynamicField, {
      props: { field, modelValue: '', disabled: true },
    })
    const span = wrapper.find('.dynamic-field__readonly')
    expect(span.exists()).toBe(true)
    expect(span.text()).toBe('—')
  })
})
