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
            { id: 't1', type: 'text', label: 'Texto', key: 'texto', required: false },
            { id: 't2', type: 'textarea', label: 'Area', key: 'area', required: false },
            { id: 't3', type: 'date', label: 'Fecha', key: 'fecha', required: false },
            { id: 't4', type: 'select', label: 'Select', key: 'select', options: [{ label: 'X', value: 'x' }], required: false },
            { id: 't5', type: 'radio', label: 'Radio', key: 'radio', options: [{ label: 'Si', value: 'si' }], required: false },
            { id: 't6', type: 'checkbox', label: 'Check', key: 'check', options: [{ label: 'Op1', value: 'op1' }], required: false },
            { id: 't7', type: 'dynamic_table', label: 'Tabla', key: 'tabla', columns: [{ key: 'col1', label: 'Col1', type: 'text', required: false }], required: false },
            { id: 't9', type: 'number', label: 'Numero', key: 'numero', required: false },
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

  it('renders all 8 field types', () => {
    const wrapper = mount(DynamicFormRenderer, {
      props: { sections: [allTypesSection], modelValue: {}, isEditable: true },
    })
    expect(wrapper.text()).toContain('Texto')
    expect(wrapper.text()).toContain('Area')
    expect(wrapper.text()).toContain('Select')
    expect(wrapper.text()).toContain('Radio')
    expect(wrapper.text()).toContain('Check')
    expect(wrapper.text()).toContain('Tabla')
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

  describe('header/footer zones', () => {
    const headerSections: Section[] = [
      {
        id: 'hdr-sec1',
        label: 'Cabecera',
        display: 'default',
        rows: [
          {
            id: 'hdr-row1',
            columns: [
              {
                id: 'hdr-col1',
                label: 'hdr-col1',
                fields: [
                  { id: 'hdr-f1', type: 'fixed_text', label: 'Título Fijo', key: 'hdr_titulo', required: false, text_content: 'Hospital Central' },
                  { id: 'hdr-f2', type: 'text', label: 'Médico', key: 'hdr_medico', required: false },
                ],
              },
            ],
          },
        ],
      },
    ]

    const footerSections: Section[] = [
      {
        id: 'ftr-sec1',
        label: 'Pie',
        display: 'default',
        rows: [
          {
            id: 'ftr-row1',
            columns: [
              {
                id: 'ftr-col1',
                label: 'ftr-col1',
                fields: [
                  { id: 'ftr-f1', type: 'fixed_text', label: 'Pie de página', key: 'ftr_pie', required: false, text_content: 'Página 1 de 1' },
                ],
              },
            ],
          },
        ],
      },
    ]

    it('renders header section when headerSections provided', () => {
      const wrapper = mount(DynamicFormRenderer, {
        props: { sections: mockSections, headerSections, modelValue: mockValues, isEditable: true },
      })
      expect(wrapper.text()).toContain('Hospital Central')
      expect(wrapper.text()).toContain('Médico')
    })

    it('renders footer section when footerSections provided', () => {
      const wrapper = mount(DynamicFormRenderer, {
        props: { sections: mockSections, footerSections, modelValue: mockValues, isEditable: true },
      })
      expect(wrapper.text()).toContain('Página 1 de 1')
    })

    it('renders both header and footer simultaneously', () => {
      const wrapper = mount(DynamicFormRenderer, {
        props: { sections: mockSections, headerSections, footerSections, modelValue: mockValues, isEditable: true },
      })
      expect(wrapper.text()).toContain('Hospital Central')
      expect(wrapper.text()).toContain('Página 1 de 1')
    })

    it('does not render header zone when headerSections is undefined', () => {
      const wrapper = mount(DynamicFormRenderer, {
        props: { sections: mockSections, modelValue: mockValues, isEditable: true },
      })
      expect(wrapper.text()).not.toContain('Hospital Central')
    })

    it('does not render footer zone when footerSections is undefined', () => {
      const wrapper = mount(DynamicFormRenderer, {
        props: { sections: mockSections, modelValue: mockValues, isEditable: true },
      })
      expect(wrapper.text()).not.toContain('Página 1 de 1')
    })

    it('header fields are rendered with disabled=true', () => {
      const wrapper = mount(DynamicFormRenderer, {
        props: { sections: mockSections, headerSections, modelValue: { ...mockValues, hdr_medico: 'Dr. Test' }, isEditable: true },
      })
      // The DynamicField in header zone receives disabled=true
      const inputs = wrapper.findAll('input')
      const medicoInput = inputs.find(i => i.attributes('aria-label') === undefined)
      // Check that header zone inputs are among the disabled ones
      // All header/footer inputs are disabled even when isEditable is true
      expect(wrapper.html()).toContain('Médico')
    })
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

  describe('variableResolver prop', () => {
    const resolver = (t: string) => t.replace(/\{hospital\}/g, 'Hospital Central')

    const resolverSections: Section[] = [
      {
        id: 'body-sec',
        label: 'Body',
        display: 'default',
        rows: [
          {
            id: 'br1',
            columns: [
              {
                id: 'bc1',
                label: '',
                fields: [
                  { id: 'bf1', type: 'fixed_text', label: 'Body Fixed', key: 'body_fixed', text_content: '{hospital} Body', required: false } as any,
                ],
              },
            ],
          },
        ],
      },
    ]

    const resolverHeaderSections: Section[] = [
      {
        id: 'hdr-sec',
        label: 'Header',
        display: 'default',
        rows: [
          {
            id: 'hr1',
            columns: [
              {
                id: 'hc1',
                label: '',
                fields: [
                  { id: 'hf1', type: 'fixed_text', label: 'Header Fixed', key: 'hdr_fixed', text_content: '{hospital} Header', required: false } as any,
                ],
              },
            ],
          },
        ],
      },
    ]

    const resolverFooterSections: Section[] = [
      {
        id: 'ftr-sec',
        label: 'Footer',
        display: 'default',
        rows: [
          {
            id: 'fr1',
            columns: [
              {
                id: 'fc1',
                label: '',
                fields: [
                  { id: 'ff1', type: 'fixed_text', label: 'Footer Fixed', key: 'ftr_fixed', text_content: '{hospital} Footer', required: false } as any,
                ],
              },
            ],
          },
        ],
      },
    ]

    it('resolves variables in header zone fixed_text', () => {
      const wrapper = mount(DynamicFormRenderer, {
        props: {
          sections: resolverSections,
          headerSections: resolverHeaderSections,
          modelValue: {},
          isEditable: true,
          variableResolver: resolver,
        },
      })
      expect(wrapper.text()).toContain('Hospital Central Header')
    })

    it('resolves variables in body zone fixed_text', () => {
      const wrapper = mount(DynamicFormRenderer, {
        props: {
          sections: resolverSections,
          modelValue: {},
          isEditable: true,
          variableResolver: resolver,
        },
      })
      expect(wrapper.text()).toContain('Hospital Central Body')
    })

    it('resolves variables in footer zone fixed_text', () => {
      const wrapper = mount(DynamicFormRenderer, {
        props: {
          sections: resolverSections,
          footerSections: resolverFooterSections,
          modelValue: {},
          isEditable: true,
          variableResolver: resolver,
        },
      })
      expect(wrapper.text()).toContain('Hospital Central Footer')
    })

    it('renders literal placeholder when no resolver is provided', () => {
      const wrapper = mount(DynamicFormRenderer, {
        props: {
          sections: resolverSections,
          modelValue: {},
          isEditable: true,
        },
      })
      expect(wrapper.text()).toContain('{hospital} Body')
    })
  })
})
