import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import UiDataTable from '@/shared/components/UiDataTable.vue'

const sampleColumns = [
  { key: 'id', field: 'id', label: 'ID', sortable: true },
  { key: 'name', field: 'name', label: 'Nombre', sortable: true },
  { key: 'email', field: 'email', label: 'Correo', sortable: false },
]

const sampleData = [
  { id: 1, name: 'Alice', email: 'alice@test.com' },
  { id: 2, name: 'Bob', email: 'bob@test.com' },
  { id: 3, name: 'Carlos', email: 'carlos@test.com' },
]

function mountTable(props = {}) {
  return mount(UiDataTable, {
    props: {
      value: sampleData,
      columns: sampleColumns,
      ...props,
    },
    global: {
      stubs: { transition: false, 'transition-group': false },
    },
  })
}

describe('UiDataTable', () => {
  describe('rendering', () => {
    it('renders column headers', () => {
      const wrapper = mountTable()
      const headers = wrapper.findAll('th .column-title')
      expect(headers.length).toBe(3)
      expect(headers[0].text()).toBe('ID')
      expect(headers[1].text()).toBe('Nombre')
      expect(headers[2].text()).toBe('Correo')
    })

    it('renders data rows', () => {
      const wrapper = mountTable()
      const rows = wrapper.findAll('tbody tr')
      expect(rows.length).toBe(3)
      // First row contains Alice
      expect(rows[0].text()).toContain('Alice')
      expect(rows[1].text()).toContain('Bob')
      expect(rows[2].text()).toContain('Carlos')
    })

    it('renders empty state when no data', () => {
      const wrapper = mountTable({ value: [] })
      expect(wrapper.find('tbody').text()).toContain('No hay datos.')
    })

    it('renders custom empty text when provided', () => {
      const wrapper = mountTable({ value: [], emptyText: 'Sin resultados.' })
      expect(wrapper.find('tbody').text()).toContain('Sin resultados.')
    })

    it('renders custom empty slot', () => {
      const wrapper = mount(UiDataTable, {
        props: { value: [], columns: sampleColumns },
        slots: { empty: '<div class="custom-empty-v1">Nada por aquí</div>' },
      })
      expect(wrapper.find('.custom-empty-v1').exists()).toBe(true)
      expect(wrapper.find('.custom-empty-v1').text()).toBe('Nada por aquí')
    })
  })

  describe('sorting', () => {
    it('shows sort icons on sortable columns', () => {
      const wrapper = mountTable()
      const sortIcons = wrapper.findAll('.sorticon')
      // Only ID and Nombre are sortable
      expect(sortIcons.length).toBe(2)
    })

    it('toggles sort on click', async () => {
      const wrapper = mountTable()
      const idHeader = wrapper.findAll('th[data-p-sortable-column="true"]')[0]
      await idHeader.trigger('click')
      // TanStack toggleSorting cycle: false → desc → asc → false
      // First click from unsorted → descending
      expect(idHeader.attributes('aria-sort')).toBe('descending')
      // Verify data is sorted: highest ID first (Carlos, id=3)
      const firstRowText = wrapper.findAll('tbody tr')[0].text()
      expect(firstRowText).toContain('Carlos')
    })

    it('cycles sort state on multiple clicks', async () => {
      const wrapper = mountTable()
      const idHeader = wrapper.findAll('th[data-p-sortable-column="true"]')[0]

      // false → desc
      await idHeader.trigger('click')
      expect(idHeader.attributes('aria-sort')).toBe('descending')

      // desc → asc
      await idHeader.trigger('click')
      expect(idHeader.attributes('aria-sort')).toBe('ascending')

      // asc → false (clears sort)
      await idHeader.trigger('click')
      expect(idHeader.attributes('aria-sort')).toBe(undefined)
    })
  })

  describe('pagination', () => {
    const largeData = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      email: `user${i + 1}@test.com`,
    }))

    it('shows paginator when enabled', () => {
      const wrapper = mountTable({ value: largeData, paginator: true, rows: 10 })
      expect(wrapper.find('nav[aria-label="Paginación"]').exists()).toBe(true)
    })

    it('does not show paginator when disabled', () => {
      const wrapper = mountTable({ value: largeData, paginator: false })
      expect(wrapper.find('nav[aria-label="Paginación"]').exists()).toBe(false)
    })

    it('shows correct page info', () => {
      const wrapper = mountTable({ value: largeData, paginator: true, rows: 10 })
      expect(wrapper.find('[aria-live="polite"]').text()).toContain('Mostrando 1 – 10 de 25')
    })

    it('can navigate to next page', async () => {
      const wrapper = mountTable({ value: largeData, paginator: true, rows: 10 })
      const nextBtn = wrapper.find('button[aria-label="Página siguiente"]')
      await nextBtn.trigger('click')
      expect(wrapper.find('[aria-live="polite"]').text()).toContain('Mostrando 11 – 20 de 25')
    })

    it('can navigate to last page', async () => {
      const wrapper = mountTable({ value: largeData, paginator: true, rows: 10 })
      const lastBtn = wrapper.find('button[aria-label="Última página"]')
      await lastBtn.trigger('click')
      expect(wrapper.find('[aria-live="polite"]').text()).toContain('Mostrando 21 – 25 de 25')
    })

    it('can change page size', async () => {
      const wrapper = mountTable({
        value: largeData,
        paginator: true,
        rows: 10,
        rowsPerPageOptions: [10, 25, 50],
      })
      const select = wrapper.find('#rowsPerPageSelect')
      await select.setValue(25)
      expect(wrapper.find('[aria-live="polite"]').text()).toContain('Mostrando 1 – 25 de 25')
    })

    it('previous page button is disabled on first page', () => {
      const wrapper = mountTable({ value: largeData, paginator: true, rows: 10 })
      const prevBtn = wrapper.find('button[aria-label="Página anterior"]')
      expect(prevBtn.element.disabled).toBe(true)
    })
  })

  describe('row selection', () => {
    it('applies striped rows class when enabled', () => {
      const wrapper = mountTable({ stripedRows: true })
      const rows = wrapper.findAll('tbody tr')
      expect(rows[1].classes()).toContain('bg-slate-50/60')
    })

    it('applies rowHover class when enabled', () => {
      const wrapper = mountTable({ rowHover: true })
      const rows = wrapper.findAll('tbody tr')
      expect(rows[0].classes()).toContain('hover:bg-indigo-50/40')
    })

    it('applies showGridlines border classes when enabled', () => {
      const wrapper = mountTable({ showGridlines: true })
      const th = wrapper.find('th')
      expect(th.classes()).toContain('border')
    })

    it('applies rowClass function to rows', () => {
      const wrapper = mountTable({
        rowClass: (row) => (row.id === 1 ? 'highlight-row' : ''),
      })
      const rows = wrapper.findAll('tbody tr')
      expect(rows[0].classes()).toContain('highlight-row')
    })

    it('applies custom table style', () => {
      const wrapper = mountTable({ tableStyle: 'font-size: 14px;' })
      expect(wrapper.find('table').attributes('style')).toContain('font-size: 14px;')
    })
  })

  describe('search / global filter', () => {
    it('filters data when global filter value is provided', () => {
      const wrapper = mountTable({
        value: sampleData,
        columns: sampleColumns,
        filters: { global: { value: 'Alice', matchMode: 'contains' } },
      })
      const rows = wrapper.findAll('tbody tr')
      expect(rows.length).toBe(1)
      expect(rows[0].text()).toContain('Alice')
    })

    it('shows no results when filter matches nothing', () => {
      const wrapper = mountTable({
        value: sampleData,
        columns: sampleColumns,
        filters: { global: { value: 'zzznotfound', matchMode: 'contains' } },
      })
      expect(wrapper.find('tbody').text()).toContain('No hay datos.')
    })

    it('shows empty state when filter produces zero rows', () => {
      const wrapper = mountTable({
        value: sampleData,
        columns: sampleColumns,
        paginator: true,
        filters: { global: { value: 'zzznotfound', matchMode: 'contains' } },
      })
      // Paginator should not render when no results
      expect(wrapper.find('nav[aria-label="Paginación"]').exists()).toBe(false)
    })
  })

  describe('custom body slots', () => {
    it('renders custom body slot for a specific column', () => {
      const wrapper = mount(UiDataTable, {
        props: { value: sampleData, columns: sampleColumns },
        slots: {
          'body-name': '<div class="custom-name-slot">{{ params.data.name }}!</div>',
        },
      })
      // Slot overrides the default text for the "name" column cells
      expect(wrapper.html()).toContain('custom-name-slot')
    })
  })

  describe('dot-notation field access', () => {
    it('renders nested field values via dot notation', () => {
      const nestedData = [
        { id: 1, profile: { name: 'Alice', city: 'NYC' } },
      ]
      const nestedCols = [
        { key: 'id', field: 'id', label: 'ID', sortable: false },
        { key: 'name', field: 'profile.name', label: 'Nombre', sortable: false },
        { key: 'city', field: 'profile.city', label: 'Ciudad', sortable: false },
      ]
      const wrapper = mount(UiDataTable, {
        props: { value: nestedData, columns: nestedCols, paginator: false },
      })
      const rowText = wrapper.findAll('tbody tr')[0].text()
      expect(rowText).toContain('Alice')
      expect(rowText).toContain('NYC')
    })
  })

  describe('non-sortable columns', () => {
    it('does not toggle sort on unsortable column click', async () => {
      const wrapper = mountTable()
      const emailHeader = wrapper.findAll('th[data-p-sortable-column="false"]')[0]
      expect(emailHeader.text()).toContain('Correo')
      await emailHeader.trigger('click')
      // No sort attribute should appear
      expect(emailHeader.attributes('aria-sort')).toBe(undefined)
    })
  })
})
