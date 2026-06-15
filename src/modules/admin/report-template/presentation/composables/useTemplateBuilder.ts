import { ref, computed, reactive, watch, type Ref, type ComputedRef } from 'vue'
import { useAuthStore } from '@/core/store/auth'
import {
  provideGetReportTemplateUseCase,
  provideCreateReportTemplateUseCase,
  provideUpdateReportTemplateUseCase,
} from '@/modules/admin/report-template/application/containers/reportTemplateContainer'
import type { Section, Row, Column, FieldConfig, FieldType, FieldBase } from '@/shared/types'
import type { TextField, NumberField, DateField, SelectionField, FixedTextField, DynamicTableField, HeaderFooterConfig } from '@/shared/types'
import { generateId } from '@/shared/utils/id'

// ============================================================================
// Types
// ============================================================================

interface UndoCommand {
  type: string
  payload: any
  /** Re-apply the original action (for redo) */
  forward: () => void
  /** Reverse the original action (for undo) */
  inverse: () => void
}

export type ZoneType = 'header' | 'body' | 'footer'

export interface UseTemplateBuilderReturn {
  sections: Section[]
  selectedFieldId: string | null
  undoStack: UndoCommand[]
  redoStack: UndoCommand[]
  isDirty: boolean
  isSaving: boolean
  templateId: number
  templateName: string
  templateDescription: string
  // Header/footer state
  activeZone: ZoneType
  headerSections: Section[]
  footerSections: Section[]
  headerEnabled: boolean
  footerEnabled: boolean
  headerPageDisplay: 'all' | 'first' | 'last'
  footerPageDisplay: 'all' | 'first' | 'last'
  activeSections: Section[]
  // Methods
  switchZone: (zone: ZoneType) => void
  loadTemplate: (id: number | string) => Promise<void>
  addSection: () => void
  removeSection: (id: string) => void
  addRow: (sectionId: string) => void
  removeRow: (rowId: string) => void
  addColumn: (rowId: string) => void
  removeColumn: (rowId: string, columnId: string) => void
  addField: (columnId: string, type: FieldType, config?: { label?: string; description?: string; required?: boolean }, index?: number) => void
  addSeparatorColumn: (rowId: string, index: number) => void
  removeField: (fieldId: string) => void
  updateField: (fieldId: string, config: Record<string, any>) => void
  reorderSections: (order: string[]) => void
  moveField: (fieldId: string, targetColumnId: string) => void
  undo: () => void
  redo: () => void
  saveTemplate: () => Promise<any>
}

const MAX_STACK = 50

/** Injection key for provide/inject pattern */
export const BUILDER_KEY = Symbol('templateBuilder')

// ============================================================================
// Helpers — multi-zone aware
// ============================================================================

function collectAllSections(
  bodySections: Section[],
  headerSections: Section[],
  footerSections: Section[]
): { sections: Section[]; source: 'header' | 'body' | 'footer' }[] {
  return [
    { sections: bodySections, source: 'body' as const },
    { sections: headerSections, source: 'header' as const },
    { sections: footerSections, source: 'footer' as const },
  ]
}

function findFieldByIdMulti(
  bodySections: Section[],
  headerSections: Section[],
  footerSections: Section[],
  fieldId: string
): { section: Section; row: Row; column: Column; field: FieldConfig; index: number; zone: 'header' | 'body' | 'footer' } | null {
  for (const { sections: secs, source } of collectAllSections(bodySections, headerSections, footerSections)) {
    for (const section of secs) {
      for (const row of section.rows) {
        for (const column of row.columns) {
          const index = column.fields.findIndex((f) => f.id === fieldId)
          if (index !== -1) {
            return { section, row, column, field: column.fields[index], index, zone: source }
          }
        }
      }
    }
  }
  return null
}

function findSectionByRowIdMulti(
  bodySections: Section[],
  headerSections: Section[],
  footerSections: Section[],
  rowId: string
): { section: Section; zone: 'header' | 'body' | 'footer' } | null {
  for (const { sections: secs, source } of collectAllSections(bodySections, headerSections, footerSections)) {
    for (const section of secs) {
      if (section.rows.some((r) => r.id === rowId)) return { section, zone: source }
    }
  }
  return null
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
}

function isDuplicateKeyMulti(
  bodySections: Section[],
  headerSections: Section[],
  footerSections: Section[],
  fieldId: string,
  newKey: string
): boolean {
  for (const { sections: secs } of collectAllSections(bodySections, headerSections, footerSections)) {
    for (const section of secs) {
      for (const row of section.rows) {
        for (const column of row.columns) {
          for (const field of column.fields) {
            if (field.id !== fieldId && field.key === newKey) {
              return true
            }
          }
        }
      }
    }
  }
  return false
}

function pushCommand(stack: Ref<UndoCommand[]>, cmd: UndoCommand): void {
  stack.value.push(cmd)
  if (stack.value.length > MAX_STACK) {
    stack.value.shift()
  }
}

function createField(type: FieldType): FieldConfig {
  const base: FieldBase = {
    id: generateId(),
    key: slugify(type),
    label: type,
    required: false,
    showLabel: true,
  }

  switch (type) {
    case 'text':
    case 'textarea':
      return { ...base, type, max_chars: undefined, placeholder: undefined, default_value: undefined }
    case 'number':
      return { ...base, type, decimals: undefined, min: undefined, max: undefined, default_value: undefined }
    case 'date':
      return { ...base, type, min_date: undefined, max_date: undefined, placeholder: undefined, default_value: undefined }
    case 'select':
    case 'multi_select':
    case 'radio':
    case 'checkbox':
      return { ...base, type, options: [], placeholder: undefined, default_value: undefined }
    case 'fixed_text':
      return { ...base, type, text_content: '', styling_options: undefined }
    case 'dynamic_table':
      return { ...base, type, columns: [], footer_totals: undefined }
    case 'vertical_separator':
      return { ...base, type, showLabel: false }
    default:
      // Exhaustive check — unreachable
      const _exhaustive: never = type
      throw new Error(`Unknown field type: ${_exhaustive}`)
  }
}

// ============================================================================
// Store
// ============================================================================

export function useTemplateBuilder(): UseTemplateBuilderReturn {
  const sections: Ref<Section[]> = ref([])
  const selectedFieldId: Ref<string | null> = ref(null)
  const undoStack: Ref<UndoCommand[]> = ref([])
  const redoStack: Ref<UndoCommand[]> = ref([])
  const isDirty: Ref<boolean> = ref(false)
  const isSaving: Ref<boolean> = ref(false)
  const templateId: Ref<number> = ref(0)
  const templateName: Ref<string> = ref('')
  const templateDescription: Ref<string> = ref('')

  // Track loaded values to detect name/description changes
  let _loadedName = ''
  let _loadedDescription = ''

  // Mark dirty when name or description changes from loaded values
  watch(templateName, (val) => {
    if (val !== _loadedName) isDirty.value = true
  })
  watch(templateDescription, (val) => {
    if (val !== _loadedDescription) isDirty.value = true
  })

  // ---- Header / Footer state ----

  const activeZone: Ref<ZoneType> = ref('body')
  const headerSections: Ref<Section[]> = ref([])
  const footerSections: Ref<Section[]> = ref([])
  const headerEnabled: Ref<boolean> = ref(false)
  const footerEnabled: Ref<boolean> = ref(false)
  const headerPageDisplay: Ref<'all' | 'first' | 'last'> = ref('all')
  const footerPageDisplay: Ref<'all' | 'first' | 'last'> = ref('all')

  /** Resolve the sections ref for a given zone (defaults to activeZone) */
  function currentSectionsRef(zone?: ZoneType): Ref<Section[]> {
    const z = zone ?? activeZone.value
    if (z === 'header') return headerSections
    if (z === 'footer') return footerSections
    return sections
  }

  /** Computed that returns the sections array for the active zone */
  const activeSections: ComputedRef<Section[]> = computed(() => {
    return currentSectionsRef().value
  })

  function switchZone(zone: ZoneType): void {
    activeZone.value = zone
    selectedFieldId.value = null
  }

  // ---- Mutations ----

  function addSection(): void {
    const ref = currentSectionsRef()
    const id = generateId()
    const section: Section = { id, label: 'Nueva sección', rows: [] }
    ref.value.push(section)
    isDirty.value = true
    redoStack.value = []

    pushCommand(undoStack, {
      type: 'addSection',
      payload: { id },
      forward: () => {
        ref.value.push(section)
      },
      inverse: () => {
        ref.value = ref.value.filter((s) => s.id !== id)
      },
    })
  }

  function removeSection(id: string): void {
    const ref = currentSectionsRef()
    const index = ref.value.findIndex((s) => s.id === id)
    if (index === -1) return
    const removed = ref.value[index]
    ref.value = ref.value.filter((s) => s.id !== id)
    if (selectedFieldId.value === id) selectedFieldId.value = null
    isDirty.value = true
    redoStack.value = []

    pushCommand(undoStack, {
      type: 'removeSection',
      payload: { index, section: JSON.parse(JSON.stringify(removed)) },
      forward: () => {
        ref.value = ref.value.filter((s) => s.id !== id)
      },
      inverse: () => {
        ref.value.splice(index, 0, removed)
      },
    })
  }

  function addRow(sectionId: string): void {
    const ref = currentSectionsRef()
    const section = ref.value.find((s) => s.id === sectionId)
    if (!section) return

    const rowId = generateId()
    const colId = generateId()
    const row: Row = {
      id: rowId,
      columns: [{ id: colId, label: '', fields: [] }],
    }
    section.rows.push(row)
    isDirty.value = true
    redoStack.value = []

    pushCommand(undoStack, {
      type: 'addRow',
      payload: { sectionId, rowId },
      forward: () => {
        const sec = ref.value.find((s) => s.id === sectionId)
        if (sec) sec.rows.push(row)
      },
      inverse: () => {
        const sec = ref.value.find((s) => s.id === sectionId)
        if (sec) sec.rows = sec.rows.filter((r) => r.id !== rowId)
      },
    })
  }

  function removeRow(rowId: string): void {
    const ref = currentSectionsRef()
    const section = ref.value.find((s) => s.rows.some((r) => r.id === rowId))
    if (!section) return
    const index = section.rows.findIndex((r) => r.id === rowId)
    if (index === -1) return
    const removed = section.rows[index]
    section.rows = section.rows.filter((r) => r.id !== rowId)
    isDirty.value = true
    redoStack.value = []

    pushCommand(undoStack, {
      type: 'removeRow',
      payload: { sectionId: section.id, index, row: JSON.parse(JSON.stringify(removed)) },
      forward: () => {
        const sec = ref.value.find((s) => s.id === section.id)
        if (sec) sec.rows.splice(index, 0, removed)
      },
      inverse: () => {
        const sec = ref.value.find((s) => s.id === section.id)
        if (sec) sec.rows = sec.rows.filter((r) => r.id !== rowId)
      },
    })
  }

  function addColumn(rowId: string): void {
    const ref = currentSectionsRef()
    const row = ref.value.flatMap((s) => s.rows).find((r) => r.id === rowId)
    if (!row) return

    const colId = generateId()
    const column: Column = { id: colId, label: '', fields: [] }
    row.columns.push(column)
    isDirty.value = true
    redoStack.value = []

    pushCommand(undoStack, {
      type: 'addColumn',
      payload: { rowId, colId },
      forward: () => {
        row.columns.push(column)
      },
      inverse: () => {
        row.columns = row.columns.filter((c) => c.id !== colId)
      },
    })
  }

  function removeColumn(rowId: string, columnId: string): void {
    const ref = currentSectionsRef()
    const row = ref.value.flatMap((s) => s.rows).find((r) => r.id === rowId)
    if (!row) return
    const index = row.columns.findIndex((c) => c.id === columnId)
    if (index === -1) return
    const removed = row.columns[index]
    row.columns = row.columns.filter((c) => c.id !== columnId)
    isDirty.value = true
    redoStack.value = []

    pushCommand(undoStack, {
      type: 'removeColumn',
      payload: { rowId, index, column: JSON.parse(JSON.stringify(removed)) },
      forward: () => {
        const r = ref.value.flatMap((s) => s.rows).find((r) => r.id === rowId)
        if (r) r.columns.splice(index, 0, removed)
      },
      inverse: () => {
        const r = ref.value.flatMap((s) => s.rows).find((r) => r.id === rowId)
        if (r) r.columns = r.columns.filter((c) => c.id !== columnId)
      },
    })
  }

  function addSeparatorColumn(rowId: string, index: number): void {
    const ref = currentSectionsRef()
    const row = ref.value.flatMap((s) => s.rows).find((r) => r.id === rowId)
    if (!row) return

    const colId = generateId()
    const fieldId = generateId()
    const separatorField: import('@/shared/types').VerticalSeparatorField = {
      id: fieldId,
      type: 'vertical_separator',
      key: 'separador',
      label: '',
      required: false,
      showLabel: false,
    }

    const column: Column = {
      id: colId,
      label: '',
      width: 40,
      fields: [separatorField],
    }

    const insertAt = Math.min(index, row.columns.length)
    row.columns.splice(insertAt, 0, column)
    selectedFieldId.value = fieldId
    isDirty.value = true
    redoStack.value = []

    pushCommand(undoStack, {
      type: 'addSeparatorColumn',
      payload: { rowId, index: insertAt, colId, fieldId },
      forward: () => {
        const r = ref.value.flatMap((s) => s.rows).find((r) => r.id === rowId)
        if (r) r.columns.splice(insertAt, 0, column)
      },
      inverse: () => {
        const r = ref.value.flatMap((s) => s.rows).find((r) => r.id === rowId)
        if (r) r.columns = r.columns.filter((c) => c.id !== colId)
      },
    })
  }

  function addField(columnId: string, type: FieldType, config?: { label?: string; description?: string; required?: boolean }, index?: number): void {
    const ref = currentSectionsRef()
    const column = ref.value
      .flatMap((s) => s.rows)
      .flatMap((r) => r.columns)
      .find((c) => c.id === columnId)
    if (!column) return

    const field = createField(type)
    if (config?.label) {
      field.label = config.label
      field.key = slugify(config.label) || slugify(type)
    }

    // Ensure unique key within all zones
    if (isDuplicateKeyMulti(sections.value, headerSections.value, footerSections.value, field.id, field.key)) {
      let suffix = 2
      while (isDuplicateKeyMulti(sections.value, headerSections.value, footerSections.value, field.id, `${field.key}_${suffix}`)) {
        suffix++
      }
      field.key = `${field.key}_${suffix}`
    }
    if (config?.description) {
      ;(field as any).placeholder = config.description
    }
    if (config?.required !== undefined) {
      field.required = config.required
    }
    if (index !== undefined) {
      column.fields.splice(index, 0, field)
    } else {
      column.fields.push(field)
    }
    selectedFieldId.value = field.id
    isDirty.value = true
    redoStack.value = []

    pushCommand(undoStack, {
      type: 'addField',
      payload: { columnId, fieldId: field.id },
      forward: () => {
        if (index !== undefined) {
          column.fields.splice(index, 0, field)
        } else {
          column.fields.push(field)
        }
      },
      inverse: () => {
        column.fields = column.fields.filter((f) => f.id !== field.id)
      },
    })
  }

  function removeField(fieldId: string): void {
    const found = findFieldByIdMulti(sections.value, headerSections.value, footerSections.value, fieldId)
    if (!found) return
    const { column, index } = found
    const removed = column.fields[index]
    column.fields = column.fields.filter((f) => f.id !== fieldId)
    if (selectedFieldId.value === fieldId) selectedFieldId.value = null
    isDirty.value = true
    redoStack.value = []

    pushCommand(undoStack, {
      type: 'removeField',
      payload: { columnId: column.id, index, field: JSON.parse(JSON.stringify(removed)) },
      forward: () => {
        column.fields = column.fields.filter((f) => f.id !== fieldId)
      },
      inverse: () => {
        column.fields.splice(index, 0, removed)
      },
    })
  }

  function updateField(fieldId: string, config: Record<string, any>): void {
    const found = findFieldByIdMulti(sections.value, headerSections.value, footerSections.value, fieldId)
    if (!found) return
    const { field } = found

    // Duplicate key validation — check all zones
    if (config.key !== undefined && config.key !== field.key) {
      if (isDuplicateKeyMulti(sections.value, headerSections.value, footerSections.value, fieldId, config.key)) {
        throw new Error(`La clave "${config.key}" ya está en uso`)
      }
    }

    const previous = JSON.parse(JSON.stringify(field))
    Object.assign(field, config)
    isDirty.value = true
    redoStack.value = []

    pushCommand(undoStack, {
      type: 'updateField',
      payload: { fieldId },
      forward: () => {
        Object.assign(field, config)
      },
      inverse: () => {
        Object.assign(field, previous)
      },
    })
  }

  function reorderSections(order: string[]): void {
    const ref = currentSectionsRef()
    if (order.length !== ref.value.length) return
    const map = new Map(ref.value.map((s) => [s.id, s]))
    const reordered = order.map((id) => map.get(id)).filter(Boolean) as Section[]
    if (reordered.length !== ref.value.length) return
    ref.value = reordered
    isDirty.value = true
  }

  function moveField(fieldId: string, targetColumnId: string): void {
    const found = findFieldByIdMulti(sections.value, headerSections.value, footerSections.value, fieldId)
    if (!found) return
    const { column, index } = found
    const field = column.fields[index]

    // Search across all zones for target column
    let targetColumn: Column | undefined
    for (const secs of [sections.value, headerSections.value, footerSections.value]) {
      targetColumn = secs
        .flatMap((s) => s.rows)
        .flatMap((r) => r.columns)
        .find((c) => c.id === targetColumnId)
      if (targetColumn) break
    }
    if (!targetColumn) return

    column.fields.splice(index, 1)
    targetColumn.fields.push(field)
    isDirty.value = true
    redoStack.value = []

    pushCommand(undoStack, {
      type: 'moveField',
      payload: { fieldId, fromColumnId: column.id, targetColumnId },
      forward: () => {
        targetColumn!.fields.push(field)
      },
      inverse: () => {
        targetColumn!.fields = targetColumn!.fields.filter((f) => f.id !== fieldId)
        column.fields.splice(index, 0, field)
      },
    })
  }

  // ---- Undo/Redo ----

  function undo(): void {
    if (undoStack.value.length === 0) return
    const cmd = undoStack.value.pop()!
    cmd.inverse()
    redoStack.value.push(cmd)
    if (redoStack.value.length > MAX_STACK) {
      redoStack.value.shift()
    }
  }

  function redo(): void {
    if (redoStack.value.length === 0) return
    const cmd = redoStack.value.pop()!
    cmd.forward()
    undoStack.value.push(cmd)
    if (undoStack.value.length > MAX_STACK) {
      undoStack.value.shift()
    }
  }

  // ---- Persistence ----

  async function loadTemplate(id: number | string): Promise<void> {
    const useCase = provideGetReportTemplateUseCase()
    const data = await useCase.execute(id)

    const structure = data.structure ?? {}
    sections.value = structure.sections ?? []

    // Restore header/footer with defaults
    const hdr: HeaderFooterConfig | undefined = structure.header
    headerSections.value = hdr?.sections ?? []
    headerEnabled.value = hdr?.enabled ?? false
    headerPageDisplay.value = hdr?.pageDisplay ?? 'all'

    const ftr: HeaderFooterConfig | undefined = structure.footer
    footerSections.value = ftr?.sections ?? []
    footerEnabled.value = ftr?.enabled ?? false
    footerPageDisplay.value = ftr?.pageDisplay ?? 'all'

    templateName.value = data.name ?? ''
    templateDescription.value = data.description ?? ''
    _loadedName = templateName.value
    _loadedDescription = templateDescription.value
    templateId.value = data.id ?? 0
    isDirty.value = false
    isSaving.value = false
    undoStack.value = []
    redoStack.value = []
    selectedFieldId.value = null
    activeZone.value = 'body'
  }

  async function saveTemplate(): Promise<any> {
    const authStore = useAuthStore()
    if (!authStore.hasPermission('admin.reporttemplate.update')) {
      throw new Error('No tiene permiso para guardar plantillas de informe')
    }

    isSaving.value = true

    try {
      const structure: Record<string, any> = { sections: sections.value }

      // Only serialize header/footer if they were ever configured (have data)
      if (headerSections.value.length > 0 || headerEnabled.value) {
        structure.header = {
          enabled: headerEnabled.value,
          pageDisplay: headerPageDisplay.value,
          sections: headerSections.value,
        }
      }
      if (footerSections.value.length > 0 || footerEnabled.value) {
        structure.footer = {
          enabled: footerEnabled.value,
          pageDisplay: footerPageDisplay.value,
          sections: footerSections.value,
        }
      }

      const payload = {
        name: templateName.value,
        description: templateDescription.value,
        structure,
      }

      let result
      if (templateId.value > 0) {
        const useCase = provideUpdateReportTemplateUseCase()
        result = await useCase.execute(templateId.value, payload)
      } else {
        const useCase = provideCreateReportTemplateUseCase()
        result = await useCase.execute(payload)
      }

      isDirty.value = false
      _loadedName = templateName.value
      _loadedDescription = templateDescription.value

      // If a new template was created, store the returned id
      if (result && result.id && templateId.value === 0) {
        templateId.value = result.id
      }

      return result
    } finally {
      isSaving.value = false
    }
  }

  return reactive({
    sections,
    selectedFieldId,
    undoStack,
    redoStack,
    isDirty,
    isSaving,
    templateId,
    templateName,
    templateDescription,
    // Header/footer state
    activeZone,
    headerSections,
    footerSections,
    headerEnabled,
    footerEnabled,
    headerPageDisplay,
    footerPageDisplay,
    activeSections,
    // Methods
    switchZone,
    loadTemplate,
    addSection,
    removeSection,
    addRow,
    removeRow,
    addColumn,
    removeColumn,
    addField,
    addSeparatorColumn,
    removeField,
    updateField,
    reorderSections,
    moveField,
    undo,
    redo,
    saveTemplate,
  }) as UseTemplateBuilderReturn
}
