import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/core/store/auth'
import DynamicFormRenderer from '../DynamicFormRenderer.vue'
import type { Section } from '@/shared/types'

const mockSections: Section[] = [
  {
    id: 'sec1',
    label: 'Datos del Paciente',
    display: 'default',
    rows: [
      {
        id: 'row1',
        columns: [
          {
            id: 'col1',
            label: 'col1',
            fields: [
              { id: 'f1', type: 'text', label: 'Nombre', key: 'nombre', required: true },
              { id: 'f2', type: 'number', label: 'Edad', key: 'edad', required: false },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'sec2',
    label: 'Signos Vitales',
    display: 'default',
    rows: [
      {
        id: 'row2',
        columns: [
          {
            id: 'col2',
            label: 'col2',
            fields: [
              { id: 'f3', type: 'date', label: 'Fecha', key: 'fecha', required: true },
              { id: 'f4', type: 'select', label: 'Tipo', key: 'tipo', required: false, options: [{ label: 'A', value: 'a' }, { label: 'B', value: 'b' }] },
            ],
          },
        ],
      },
    ],
  },
]

const allTypesSection: Section = {
  id: 'sec_all',
  label: 'Todos los tipos',
  display: 'default',
  rows: [
    {
      id: 'row_all',
      columns: [
        {
          id: 'col_all',
          label: 'col_all',
          fields: [
            { id: 't1', type: 'text', label: 'Texto', key: 'texto' },
            { id: 't2', type: 'textarea', label: 'Area', key: 'area' },
            { id: 't3', type: 'date', label: 'Fecha', key: 'fecha' },
            { id: 't4', type: 'select', label: 'Select', key: 'select', options: [{ label: 'X', value: 'x' }] },
            { id: 't5', type: 'radio', label: 'Radio', key: 'radio', options: [{ label: 'Si', value: 'si' }] },
            { id: 't6', type: 'checkbox', label: 'Check', key: 'check', options: [{ label: 'Op1', value: 'op1' }] },
            { id: 't7', type: 'dynamic_table', label: 'Tabla', key: 'tabla', columns: [{ name: 'Col1', type: 'text' }] },
            { id: 't8', type: 'signature', label: 'Firma', key: 'firma' },
            { id: 't9', type: 'number', label: 'Numero', key: 'numero' },
          ],
        },
      ],
    },
  ],
}

const mockValues = {
  nombre: 'Juan Pérez',
  edad: 30,
  fecha: '2026-06-01',
  tipo: 'a',
}

describe('DynamicFormRenderer', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders section labels', () => {
    const wrapper = mount(DynamicFormRenderer, {
      props: { sections: mockSections, modelValue: mockValues, isEditable: true },
    })
    expect(wrapper.text()).toContain('Datos del Paciente')
    expect(wrapper.text()).toContain('Signos Vitales')
  })

  it('renders fields within sections', () => {
    const wrapper = mount(DynamicFormRenderer, {
      props: { sections: mockSections, modelValue: mockValues, isEditable: true },
    })
    expect(wrapper.text()).toContain('Nombre')
    expect(wrapper.text()).toContain('Edad')
    expect(wrapper.text()).toContain('Fecha')
    expect(wrapper.text()).toContain('Tipo')
  })

  it('renders all 9 field types', () => {
    const wrapper = mount(DynamicFormRenderer, {
      props: { sections: [allTypesSection], modelValue: {}, isEditable: true },
    })
    expect(wrapper.text()).toContain('Texto')
    expect(wrapper.text()).toContain('Area')
    expect(wrapper.text()).toContain('Select')
    expect(wrapper.text()).toContain('Radio')
    expect(wrapper.text()).toContain('Check')
    expect(wrapper.text()).toContain('Tabla')
    expect(wrapper.text()).toContain('Firma')
    expect(wrapper.text()).toContain('Numero')

    // Date field label
    expect(wrapper.text()).toContain('Fecha')
  })

  it('shows empty state when sections is empty', () => {
    const wrapper = mount(DynamicFormRenderer, {
      props: { sections: [], modelValue: {}, isEditable: true },
    })
    expect(wrapper.text()).toContain('no tiene campos configurados')
  })

  it('renders inputs disabled when isEditable is false', () => {
    const wrapper = mount(DynamicFormRenderer, {
      props: { sections: mockSections, modelValue: mockValues, isEditable: false },
    })
    const inputs = wrapper.findAll('input')
    for (const input of inputs) {
      // Some inputs might be of type hidden or specific non-disableable types
      if (input.attributes('type') !== 'hidden') {
        expect(input.attributes('disabled')).toBeDefined()
      }
    }
  })

  it('renders inputs enabled when isEditable is true', () => {
    const wrapper = mount(DynamicFormRenderer, {
      props: { sections: mockSections, modelValue: mockValues, isEditable: true },
    })
    const inputs = wrapper.findAll('input')
    // At least some inputs should not be disabled
    const enabledInputs = inputs.filter(i => i.attributes('disabled') === undefined)
    expect(enabledInputs.length).toBeGreaterThan(0)
  })

  it('emits update:modelValue when a field changes', async () => {
    const wrapper = mount(DynamicFormRenderer, {
      props: { sections: mockSections, modelValue: mockValues, isEditable: true },
    })
    // Find a text input and type in it
    const textInput = wrapper.find('input[type="text"]')
    if (textInput.exists()) {
      await textInput.setValue('Nuevo nombre')
      // Should emit update:modelValue with updated values
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      const emitted = wrapper.emitted('update:modelValue')!
      const lastEmit = emitted[emitted.length - 1][0]
      expect(lastEmit).toHaveProperty('nombre', 'Nuevo nombre')
    }
  })

  it('emits auto-save after debounce on change', async () => {
    vi.useFakeTimers()
    const wrapper = mount(DynamicFormRenderer, {
      props: { sections: mockSections, modelValue: mockValues, isEditable: true },
    })
    const textInput = wrapper.find('input[type="text"]')
    if (textInput.exists()) {
      await textInput.setValue('Auto save test')
      // Fast-forward past the 2s debounce
      vi.advanceTimersByTime(2100)
      expect(wrapper.emitted('auto-save')).toBeTruthy()
    }
    vi.useRealTimers()
  })

  it('disables auto-save when isEditable is false', async () => {
    vi.useFakeTimers()
    const wrapper = mount(DynamicFormRenderer, {
      props: { sections: mockSections, modelValue: mockValues, isEditable: false },
    })
    const textInput = wrapper.find('input[type="text"]')
    if (textInput.exists()) {
      await textInput.setValue('No auto save')
      vi.advanceTimersByTime(2100)
      expect(wrapper.emitted('auto-save')).toBeFalsy()
    }
    vi.useRealTimers()
  })

  it('shows conditional field when condition is met', () => {
    const sectionsWithCondition: Section[] = [
      {
        id: 'sec_c',
        label: 'Condicional',
        display: 'default',
        rows: [
          {
            id: 'row_c',
            columns: [
              {
                id: 'col_c',
                label: 'col_c',
                fields: [
                  { id: 'f_c1', type: 'text', label: 'Trigger', key: 'trigger' },
                  {
                    id: 'f_c2',
                    type: 'textarea',
                    label: 'Condicional',
                    key: 'condicional',
                    conditionalRule: { field: 'trigger', op: '==', value: 'mostrar' },
                  },
                ],
              },
            ],
          },
        ],
      },
    ]
    const wrapper = mount(DynamicFormRenderer, {
      props: { sections: sectionsWithCondition, modelValue: { trigger: 'mostrar' }, isEditable: true },
    })
    expect(wrapper.text()).toContain('Condicional')
  })

  it('hides conditional field when condition is not met', () => {
    const sectionsWithCondition: Section[] = [
      {
        id: 'sec_c',
        label: 'Condicional',
        display: 'default',
        rows: [
          {
            id: 'row_c',
            columns: [
              {
                id: 'col_c',
                label: 'col_c',
                fields: [
                  { id: 'f_c1', type: 'text', label: 'Trigger', key: 'trigger' },
                  {
                    id: 'f_c2',
                    type: 'textarea',
                    label: 'Condicional',
                    key: 'condicional',
                    conditionalRule: { field: 'trigger', op: '==', value: 'mostrar' },
                  },
                ],
              },
            ],
          },
        ],
      },
    ]
    const wrapper = mount(DynamicFormRenderer, {
      props: { sections: sectionsWithCondition, modelValue: { trigger: 'ocultar' }, isEditable: true },
    })
    // The conditional textarea should NOT be rendered
    expect(wrapper.find('textarea').exists()).toBe(false)
  })

  describe('permission checks', () => {
    it('isEditable starts false and is overridden by prop', () => {
      // The component uses isEditable prop directly
      const wrapper = mount(DynamicFormRenderer, {
        props: { sections: mockSections, modelValue: mockValues, isEditable: false },
      })
      const inputs = wrapper.findAll('input[type="text"]')
      for (const input of inputs) {
        expect(input.attributes('disabled')).toBeDefined()
      }
    })

    it('isEditable true enables inputs', () => {
      const wrapper = mount(DynamicFormRenderer, {
        props: { sections: mockSections, modelValue: mockValues, isEditable: true },
      })
      const inputs = wrapper.findAll('input[type="text"]')
      const enabledInputs = inputs.filter(i => i.attributes('disabled') === undefined)
      expect(enabledInputs.length).toBeGreaterThan(0)
    })
  })
})
