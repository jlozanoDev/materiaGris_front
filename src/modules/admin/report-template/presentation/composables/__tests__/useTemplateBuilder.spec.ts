import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTemplateBuilder } from '../useTemplateBuilder'
import { useAuthStore } from '@/core/store/auth'
import type { Section } from '@/shared/types'

// ============================================================================
// Mock DI container — intercept save operations
// ============================================================================

const mockGetUseCase = { execute: vi.fn() }
const mockCreateUseCase = { execute: vi.fn() }
const mockUpdateUseCase = { execute: vi.fn() }

vi.mock('@/modules/admin/report-template/application/containers/reportTemplateContainer', () => ({
  provideGetReportTemplateUseCase: () => mockGetUseCase,
  provideCreateReportTemplateUseCase: () => mockCreateUseCase,
  provideUpdateReportTemplateUseCase: () => mockUpdateUseCase,
}))

// ============================================================================
// Helpers
// ============================================================================

function authWithPermission(slug: string) {
  const authStore = useAuthStore()
  authStore.user = {
    id: 1,
    name: 'Admin',
    email: 'admin@test.com',
    permissions: [slug],
  }
}

function authWithNoPermission() {
  const authStore = useAuthStore()
  authStore.user = {
    id: 1,
    name: 'Admin',
    email: 'admin@test.com',
    permissions: ['admin.reporttemplate.view'],
  }
}

function addDefaultSection(store: ReturnType<typeof useTemplateBuilder>) {
  store.addSection()
  return store.sections[0]
}

function addDefaultRow(store: ReturnType<typeof useTemplateBuilder>, sectionId: string) {
  store.addRow(sectionId)
  const section = store.sections.find((s: Section) => s.id === sectionId)
  return section!.rows[0]
}

function addDefaultColumn(store: ReturnType<typeof useTemplateBuilder>, rowId: string) {
  store.addColumn(rowId)
  const section = store.sections[0]
  const row = section.rows.find((r) => r.id === rowId)
  return row!.columns[0]
}

function addTextField(store: ReturnType<typeof useTemplateBuilder>, columnId: string) {
  store.addField(columnId, 'text')
  const section = store.sections[0]
  const row = section.rows[0]
  const col = row.columns.find((c) => c.id === columnId)
  return col!.fields[0]
}

// ============================================================================
// Tests
// ============================================================================

describe('useTemplateBuilder', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    authWithPermission('admin.reporttemplate.update')
    vi.clearAllMocks()
    mockGetUseCase.execute.mockResolvedValue({ id: 1, name: 'Existing', description: '', structure: { sections: [] } })
    mockCreateUseCase.execute.mockResolvedValue({ id: 99 })
    mockUpdateUseCase.execute.mockResolvedValue({ id: 1 })
  })

  // --- Initial state ---

  it('starts with empty sections and no selection', () => {
    const store = useTemplateBuilder()
    expect(store.sections).toEqual([])
    expect(store.selectedFieldId).toBeNull()
    expect(store.isDirty).toBe(false)
    expect(store.templateName).toBe('')
    expect(store.templateDescription).toBe('')
  })

  // --- addSection ---

  it('addSection creates a section with default values', () => {
    const store = useTemplateBuilder()
    store.addSection()

    expect(store.sections).toHaveLength(1)
    const section = store.sections[0]
    expect(section.id).toBeDefined()
    expect(typeof section.id).toBe('string')
    expect(section.label).toBe('Nueva sección')
    expect(section.rows).toEqual([])
    expect(store.isDirty).toBe(true)
  })

  it('addSection pushes undo command', () => {
    const store = useTemplateBuilder()
    expect(store.undoStack).toHaveLength(0)

    store.addSection()
    expect(store.undoStack).toHaveLength(1)
    expect(store.undoStack[0].type).toBe('addSection')
  })

  it('addSection leaves templateId at 0 for new templates', () => {
    const store = useTemplateBuilder()
    store.addSection()
    store.addSection()

    expect(store.templateId).toBe(0)
  })

  // --- removeSection ---

  it('removeSection removes the section and pushes undo', () => {
    const store = useTemplateBuilder()
    store.addSection()
    const sectionId = store.sections[0].id

    store.removeSection(sectionId)
    expect(store.sections).toHaveLength(0)
    expect(store.undoStack).toHaveLength(2) // addSection + removeSection
    expect(store.undoStack[1].type).toBe('removeSection')
  })

  it('removeSection does nothing for unknown id', () => {
    const store = useTemplateBuilder()
    store.addSection()
    expect(store.sections).toHaveLength(1)

    store.removeSection('nonexistent')
    expect(store.sections).toHaveLength(1)
  })

  // --- addRow ---

  it('addRow creates a row with default single column', () => {
    const store = useTemplateBuilder()
    const section = addDefaultSection(store)

    store.addRow(section.id)
    expect(section.rows).toHaveLength(1)
    const row = section.rows[0]
    expect(row.id).toBeDefined()
    expect(row.columns).toHaveLength(1)
    expect(row.columns[0].id).toBeDefined()
    expect(row.columns[0].fields).toEqual([])
  })

  it('addRow does nothing for unknown section', () => {
    const store = useTemplateBuilder()
    store.addRow('nonexistent')
    expect(store.sections).toHaveLength(0)
  })

  // --- removeRow ---

  it('removeRow removes row and its columns', () => {
    const store = useTemplateBuilder()
    const section = addDefaultSection(store)
    store.addRow(section.id)
    const rowId = section.rows[0].id

    store.removeRow(rowId)
    expect(section.rows).toHaveLength(0)
  })

  it('removeRow does nothing for unknown row', () => {
    const store = useTemplateBuilder()
    const section = addDefaultSection(store)
    store.addRow(section.id)

    store.removeRow('nonexistent')
    expect(section.rows).toHaveLength(1)
  })

  // --- addColumn ---

  it('addColumn adds a column with default width to a row', () => {
    const store = useTemplateBuilder()
    const section = addDefaultSection(store)
    store.addRow(section.id)
    const rowId = section.rows[0].id

    store.addColumn(rowId)
    expect(section.rows[0].columns).toHaveLength(2) // 1 default + 1 new
    expect(section.rows[0].columns[1].fields).toEqual([])
  })

  it('addColumn does nothing for unknown row', () => {
    const store = useTemplateBuilder()
    store.addSection()
    const sectionBefore = JSON.parse(JSON.stringify(store.sections))
    store.addColumn('nonexistent')
    expect(store.sections).toEqual(sectionBefore)
  })

  // --- addField ---

  it('addField creates a field with given type in column', () => {
    const store = useTemplateBuilder()
    const section = addDefaultSection(store)
    const row = addDefaultRow(store, section.id)
    const col = addDefaultColumn(store, row.id)
    const colId = col.id

    store.addField(colId, 'text')
    expect(col.fields).toHaveLength(1)
    const field = col.fields[0]
    expect(field.id).toBeDefined()
    expect(field.type).toBe('text')
    expect(field.label).toBe('text')
    expect(field.key).toBeDefined()
    expect(field.required).toBe(false)
  })

  it('addField with select type includes empty options array', () => {
    const store = useTemplateBuilder()
    const section = addDefaultSection(store)
    const row = addDefaultRow(store, section.id)
    const col = addDefaultColumn(store, row.id)

    store.addField(col.id, 'select')
    const field = col.fields[0]
    expect(field.type).toBe('select')
    expect((field as any).options).toEqual([])
  })

  it('addField with dynamic_table type includes empty columns array', () => {
    const store = useTemplateBuilder()
    const section = addDefaultSection(store)
    const row = addDefaultRow(store, section.id)
    const col = addDefaultColumn(store, row.id)

    store.addField(col.id, 'dynamic_table')
    const field = col.fields[0]
    expect(field.type).toBe('dynamic_table')
    expect((field as any).columns).toEqual([])
  })

  // --- removeField ---

  it('removeField removes a field by id', () => {
    const store = useTemplateBuilder()
    const section = addDefaultSection(store)
    const row = addDefaultRow(store, section.id)
    const col = addDefaultColumn(store, row.id)
    const field = addTextField(store, col.id)

    store.removeField(field.id)
    expect(col.fields).toHaveLength(0)
  })

  // --- updateField ---

  it('updateField updates field config and marks dirty', () => {
    const store = useTemplateBuilder()
    const section = addDefaultSection(store)
    const row = addDefaultRow(store, section.id)
    const col = addDefaultColumn(store, row.id)
    const field = addTextField(store, col.id)

    store.isDirty = false // reset after add ops
    store.updateField(field.id, { label: 'Nombre del paciente', required: true, placeholder: 'Ingrese nombre' })

    const updated = col.fields[0]
    expect(updated.label).toBe('Nombre del paciente')
    expect(updated.required).toBe(true)
    expect((updated as any).placeholder).toBe('Ingrese nombre')
    expect(store.isDirty).toBe(true)
  })

  it('updateField validates duplicate keys', () => {
    const store = useTemplateBuilder()
    const section = addDefaultSection(store)
    const row = addDefaultRow(store, section.id)
    const col = addDefaultColumn(store, row.id)

    // Add two fields
    store.addField(col.id, 'text')
    const field1 = col.fields[0]
    const field1Id = field1.id

    store.addField(col.id, 'text')
    const field2 = col.fields[1]
    const field2Id = field2.id

    // Change field1's key
    store.updateField(field1Id, { key: 'unique_key' })
    expect(col.fields[0].key).toBe('unique_key')

    // Try to set field2 with same key → should fail
    expect(() => {
      store.updateField(field2Id, { key: 'unique_key' })
    }).toThrow(/ya está en uso|duplicada|duplicate/i)
  })

  it('updateField does nothing for unknown field id', () => {
    const store = useTemplateBuilder()
    const section = addDefaultSection(store)
    const row = addDefaultRow(store, section.id)
    const col = addDefaultColumn(store, row.id)
    store.addField(col.id, 'text')
    const stateBefore = JSON.parse(JSON.stringify(store.sections))
    store.updateField('nonexistent', { label: 'Test' })
    expect(store.sections).toEqual(stateBefore)
  })

  // --- reorderSections ---

  it('reorderSections reorders sections by given ids', () => {
    const store = useTemplateBuilder()
    store.addSection()
    store.addSection()
    store.addSection()

    const ids = store.sections.map((s: Section) => s.id)
    // Reverse order
    const reversed = [ids[2], ids[1], ids[0]]
    store.reorderSections(reversed)

    expect(store.sections[0].id).toBe(ids[2])
    expect(store.sections[1].id).toBe(ids[1])
    expect(store.sections[2].id).toBe(ids[0])
  })

  // --- undo / redo ---

  it('undo reverses the last mutation', () => {
    const store = useTemplateBuilder()
    expect(store.sections).toHaveLength(0)

    store.addSection()
    expect(store.sections).toHaveLength(1)

    store.undo()
    expect(store.sections).toHaveLength(0)
  })

  it('redo re-applies an undone mutation', () => {
    const store = useTemplateBuilder()
    store.addSection()
    const sectionId = store.sections[0].id

    store.undo()
    expect(store.sections).toHaveLength(0)

    store.redo()
    expect(store.sections).toHaveLength(1)
    expect(store.sections[0].id).toBe(sectionId)
  })

  it('undo does nothing when stack is empty', () => {
    const store = useTemplateBuilder()
    store.undo()
    expect(store.sections).toHaveLength(0)
  })

  it('redo does nothing when stack is empty', () => {
    const store = useTemplateBuilder()
    store.redo()
    expect(store.sections).toHaveLength(0)
  })

  it('undo/redo stacks are capped at 50', () => {
    const store = useTemplateBuilder()
    for (let i = 0; i < 60; i++) {
      store.addSection()
    }
    expect(store.undoStack.length).toBeLessThanOrEqual(50)
  })

  it('new mutation clears redo stack', () => {
    const store = useTemplateBuilder()
    store.addSection()
    store.undo()
    expect(store.redoStack).toHaveLength(1)

    store.addSection() // new mutation
    expect(store.redoStack).toHaveLength(0)
  })

  // --- moveField ---

  it('moveField moves a field between columns', () => {
    const store = useTemplateBuilder()
    const section = addDefaultSection(store)
    const row = addDefaultRow(store, section.id)
    const col1 = addDefaultColumn(store, row.id)

    // Add second column
    store.addColumn(row.id)
    const col2 = row.columns[1]

    // Add field to col1
    const field = addTextField(store, col1.id)
    const fieldId = field.id

    store.moveField(fieldId, col2.id)
    expect(col1.fields).toHaveLength(0)
    expect(col2.fields).toHaveLength(1)
    expect(col2.fields[0].id).toBe(fieldId)
  })

  // --- saveTemplate (permission check) ---

  it('saveTemplate throws if user lacks admin.reporttemplate.update', async () => {
    authWithNoPermission()
    const store = useTemplateBuilder()
    store.addSection()

    await expect(store.saveTemplate()).rejects.toThrow(/permiso|permission/i)
  })

  it('saveTemplate calls create use case for new template', async () => {
    mockCreateUseCase.execute.mockResolvedValue({ id: 99, name: 'Test Template' })
    const store = useTemplateBuilder()
    store.templateName = 'Test Template'
    store.addSection()

    const result = await store.saveTemplate()
    expect(mockCreateUseCase.execute).toHaveBeenCalled()
    expect(result).toEqual({ id: 99, name: 'Test Template' })
    expect(store.isDirty).toBe(false)
  })

  // --- templateId counter ---

  it('templateId stays 0 until loaded or saved', () => {
    const store = useTemplateBuilder()
    expect(store.templateId).toBe(0)
    store.addSection()
    expect(store.templateId).toBe(0)
    store.addSection()
    expect(store.templateId).toBe(0)
  })

  // ============================================================================
  // Header / Footer
  // ============================================================================

  describe('header/footer state', () => {
    it('starts with header disabled and empty', () => {
      const store = useTemplateBuilder()
      expect(store.headerEnabled).toBe(false)
      expect(store.headerSections).toEqual([])
      expect(store.headerPageDisplay).toBe('all')
    })

    it('starts with footer disabled and empty', () => {
      const store = useTemplateBuilder()
      expect(store.footerEnabled).toBe(false)
      expect(store.footerSections).toEqual([])
      expect(store.footerPageDisplay).toBe('all')
    })

    it('activeZone defaults to body', () => {
      const store = useTemplateBuilder()
      expect(store.activeZone).toBe('body')
    })

    it('activeSections reflects body sections by default', () => {
      const store = useTemplateBuilder()
      store.addSection()
      expect(store.activeSections).toHaveLength(1)
      expect(store.activeSections[0]).toBe(store.sections[0])
    })

    it('switchZone changes activeZone and clears selectedFieldId', () => {
      const store = useTemplateBuilder()
      store.addSection()
      store.switchZone('header')
      expect(store.activeZone).toBe('header')
      expect(store.selectedFieldId).toBeNull()
    })

    it('activeSections returns headerSections when on header zone', () => {
      const store = useTemplateBuilder()
      store.switchZone('header')
      store.addSection()
      expect(store.activeSections).toHaveLength(1)
      expect(store.activeSections).toBe(store.headerSections)
    })

    it('activeSections returns footerSections when on footer zone', () => {
      const store = useTemplateBuilder()
      store.switchZone('footer')
      store.addSection()
      expect(store.footerSections).toHaveLength(1)
      expect(store.activeSections).toBe(store.footerSections)
    })

    it('mutations on header zone affect headerSections only', () => {
      const store = useTemplateBuilder()
      store.switchZone('header')
      store.addSection()
      expect(store.headerSections).toHaveLength(1)
      expect(store.sections).toHaveLength(0)
      expect(store.footerSections).toHaveLength(0)
    })

    it('mutations on footer zone affect footerSections only', () => {
      const store = useTemplateBuilder()
      store.switchZone('footer')
      store.addSection()
      expect(store.footerSections).toHaveLength(1)
      expect(store.sections).toHaveLength(0)
      expect(store.headerSections).toHaveLength(0)
    })
  })

  describe('header/footer persistence', () => {
    it('loadTemplate restores header/footer with defaults when absent', async () => {
      mockGetUseCase.execute.mockResolvedValue({
        id: 1,
        name: 'Legacy',
        description: '',
        structure: { sections: [] },
      })
      const store = useTemplateBuilder()
      await store.loadTemplate(1)
      expect(store.headerEnabled).toBe(false)
      expect(store.headerSections).toEqual([])
      expect(store.headerPageDisplay).toBe('all')
      expect(store.footerEnabled).toBe(false)
      expect(store.footerSections).toEqual([])
      expect(store.footerPageDisplay).toBe('all')
    })

    it('loadTemplate restores header/footer when present', async () => {
      mockGetUseCase.execute.mockResolvedValue({
        id: 1,
        name: 'With Header',
        description: '',
        structure: {
          sections: [],
          header: { enabled: true, pageDisplay: 'first', sections: [{ id: 'h1', label: 'Header', display: 'default', rows: [] }] },
          footer: { enabled: true, pageDisplay: 'last', sections: [{ id: 'f1', label: 'Footer', display: 'default', rows: [] }] },
        },
      })
      const store = useTemplateBuilder()
      await store.loadTemplate(1)
      expect(store.headerEnabled).toBe(true)
      expect(store.headerSections).toHaveLength(1)
      expect(store.headerSections[0].id).toBe('h1')
      expect(store.headerPageDisplay).toBe('first')
      expect(store.footerEnabled).toBe(true)
      expect(store.footerSections).toHaveLength(1)
      expect(store.footerSections[0].id).toBe('f1')
      expect(store.footerPageDisplay).toBe('last')
    })

    it('saveTemplate serializes header/footer when enabled', async () => {
      mockCreateUseCase.execute.mockResolvedValue({ id: 99 })
      const store = useTemplateBuilder()
      store.switchZone('header')
      store.addSection()
      store.headerEnabled = true
      store.headerPageDisplay = 'first'

      await store.saveTemplate()
      const payload = mockCreateUseCase.execute.mock.calls[0][0]
      expect(payload.structure.header).toBeDefined()
      expect(payload.structure.header.enabled).toBe(true)
      expect(payload.structure.header.pageDisplay).toBe('first')
      expect(payload.structure.header.sections).toHaveLength(1)
      expect(payload.structure.footer).toBeUndefined() // not enabled
    })

    it('saveTemplate omits footer when not configured', async () => {
      mockCreateUseCase.execute.mockResolvedValue({ id: 99 })
      const store = useTemplateBuilder()
      store.templateName = 'Test'

      await store.saveTemplate()
      const payload = mockCreateUseCase.execute.mock.calls[0][0]
      expect(payload.structure.footer).toBeUndefined()
      expect(payload.structure.header).toBeUndefined()
    })
  })

  describe('cross-zone findFieldById', () => {
    it('finds field in header zone', () => {
      const store = useTemplateBuilder()
      store.switchZone('header')
      store.addSection()
      const section = store.headerSections[0]
      store.addRow(section.id)
      const row = section.rows[0]
      store.addColumn(row.id)
      const col = row.columns[0]
      store.addField(col.id, 'text')
      const fieldId = col.fields[0].id

      // removeField uses findFieldByIdMulti internally and should find it
      store.removeField(fieldId)
      expect(col.fields).toHaveLength(0)
    })

    it('validates duplicate keys across all zones', () => {
      const store = useTemplateBuilder()
      // Add field in body
      store.addSection()
      const section = store.sections[0]
      store.addRow(section.id)
      const row = section.rows[0]
      store.addColumn(row.id)
      const col = row.columns[0]
      store.addField(col.id, 'text')
      const field1 = col.fields[0]
      store.updateField(field1.id, { key: 'shared_key' })

      // Add field in header with same key
      store.switchZone('header')
      store.addSection()
      const hSection = store.headerSections[0]
      store.addRow(hSection.id)
      const hRow = hSection.rows[0]
      store.addColumn(hRow.id)
      const hCol = hRow.columns[0]
      store.addField(hCol.id, 'text')
      const field2 = hCol.fields[0]

      // Attempting to set same key should fail
      expect(() => {
        store.updateField(field2.id, { key: 'shared_key' })
      }).toThrow(/ya está en uso|duplicada|duplicate/i)
    })
  })
})
