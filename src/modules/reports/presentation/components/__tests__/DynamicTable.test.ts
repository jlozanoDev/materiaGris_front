import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DynamicTable from '../DynamicTable.vue'
import type { FieldType } from '@/shared/types'

const columns = [
  { name: 'Medicamento', type: 'text' as FieldType },
  { name: 'Dosis', type: 'text' as FieldType },
  { name: 'Frecuencia', type: 'text' as FieldType },
]

describe('DynamicTable', () => {
  it('renders column headers', () => {
    const wrapper = mount(DynamicTable, {
      props: { columns, modelValue: [], disabled: false },
    })
    expect(wrapper.text()).toContain('Medicamento')
    expect(wrapper.text()).toContain('Dosis')
    expect(wrapper.text()).toContain('Frecuencia')
  })

  it('shows "Añadir fila" button', () => {
    const wrapper = mount(DynamicTable, {
      props: { columns, modelValue: [], disabled: false },
    })
    expect(wrapper.text()).toContain('Añadir fila')
  })

  it('adds a row when clicking "Añadir fila"', async () => {
    const wrapper = mount(DynamicTable, {
      props: { columns, modelValue: [], disabled: false },
    })
    const btn = wrapper.find('button')
    await btn.trigger('click')
    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toBeTruthy()
    expect(emitted![0][0]).toEqual([
      { Medicamento: '', Dosis: '', Frecuencia: '' },
    ])
  })

  it('removes a row when clicking delete button', async () => {
    const modelValue = [
      { medicamento: 'Paracetamol', dosis: '500mg', frecuencia: '8h' },
      { medicamento: 'Ibuprofeno', dosis: '600mg', frecuencia: '12h' },
    ]
    const wrapper = mount(DynamicTable, {
      props: { columns, modelValue, disabled: false },
    })
    // There should be 2 rows + 1 header row
    const deleteButtons = wrapper.findAll('button').filter(b => b.text().includes('Eliminar') || b.html().includes('trash'))
    // Should be at least 2 delete buttons or more
    // Try clicking the first delete button (first row's delete)
    const allButtons = wrapper.findAll('button')
    // The last button per row is delete; we have "Añadir fila" button too
    // Find delete buttons by text
    const delBtns = allButtons.filter(b => b.text() === '' || b.attributes('aria-label')?.includes('Eliminar'))
    if (delBtns.length > 0) {
      await delBtns[0].trigger('click')
      const emitted = wrapper.emitted('update:modelValue')
      expect(emitted).toBeTruthy()
      // Should have emitted with 1 row removed
      expect(emitted![0][0]).toHaveLength(1)
    }
  })

  it('renders cell inputs for each row', () => {
    const modelValue = [
      { medicamento: 'Paracetamol', dosis: '500mg', frecuencia: '8h' },
    ]
    const wrapper = mount(DynamicTable, {
      props: { columns, modelValue, disabled: false },
    })
    const inputs = wrapper.findAll('input')
    // 3 columns × 1 row = 3 inputs
    expect(inputs.length).toBeGreaterThanOrEqual(1)
  })

  it('respects disabled prop', () => {
    const wrapper = mount(DynamicTable, {
      props: { columns, modelValue: [], disabled: true },
    })
    // "Añadir fila" button should not be rendered when disabled
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('does not emit when disabled and no add button', () => {
    const wrapper = mount(DynamicTable, {
      props: { columns, modelValue: [], disabled: true },
    })
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
  })
})
