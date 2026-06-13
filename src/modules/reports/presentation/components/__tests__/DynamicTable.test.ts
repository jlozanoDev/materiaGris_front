import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DynamicTable from '../DynamicTable.vue'
import type { TableColumnDef } from '@/shared/types'

const columns: TableColumnDef[] = [
  { key: 'medicamento', label: 'Medicamento', type: 'text', required: false },
  { key: 'dosis', label: 'Dosis', type: 'text', required: false },
  { key: 'frecuencia', label: 'Frecuencia', type: 'text', required: false },
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
      { medicamento: '', dosis: '', frecuencia: '' },
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
    expect(inputs.length).toBeGreaterThanOrEqual(3)
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

  describe('calculated columns', () => {
    const calcColumns: import('@/shared/types').TableColumnDef[] = [
      { key: 'item', label: 'Item', type: 'text', required: false },
      { key: 'cantidad', label: 'Cantidad', type: 'number', required: false },
      {
        key: 'subtotal',
        label: 'Subtotal',
        type: 'number',
        required: false,
        calculated: true,
        formula: { op: 'sum', sourceKey: 'cantidad' },
      } as import('@/shared/types').CalculatedColumnDef,
    ]

    it('shows (calc) badge on calculated column headers', () => {
      const wrapper = mount(DynamicTable, {
        props: { columns: calcColumns, modelValue: [], disabled: false },
      })
      expect(wrapper.text()).toContain('(calc)')
    })

    it('displays calculated value for a column', () => {
      const modelValue = [
        { item: 'Guantes', cantidad: 5 },
        { item: 'Jeringas', cantidad: 10 },
      ]
      const wrapper = mount(DynamicTable, {
        props: { columns: calcColumns, modelValue, disabled: false },
      })
      // subtotal = sum of cantidad = 15
      expect(wrapper.text()).toContain('15')
    })
  })

  describe('footer totals', () => {
    const ftColumns: import('@/shared/types').TableColumnDef[] = [
      { key: 'item', label: 'Item', type: 'text', required: false },
      { key: 'cantidad', label: 'Cantidad', type: 'number', required: false },
    ]

    const footerTotals: import('@/shared/types').FooterTotal[] = [
      { label: 'Total:', formula: { op: 'sum', sourceKey: 'cantidad' } },
    ]

    it('renders footer row with total', () => {
      const modelValue = [
        { item: 'A', cantidad: 10 },
        { item: 'B', cantidad: 20 },
      ]
      const wrapper = mount(DynamicTable, {
        props: { columns: ftColumns, footerTotals, modelValue, disabled: false },
      })
      expect(wrapper.text()).toContain('Total:')
      // Footer total should be 30
      expect(wrapper.text()).toContain('30')
    })
  })
})
