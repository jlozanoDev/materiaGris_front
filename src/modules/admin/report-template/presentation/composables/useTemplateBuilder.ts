import { ref, reactive, type Ref } from 'vue'
import { useAuthStore } from '@/core/store/auth'
import {
  provideGetReportTemplateUseCase,
  provideCreateReportTemplateUseCase,
  provideUpdateReportTemplateUseCase,
} from '@/modules/admin/report-template/application/containers/reportTemplateContainer'
import type { Section, Row, Column, FieldConfig, FieldType } from '@/shared/types'

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

export interface UseTemplateBuilderReturn {
  sections: Ref<Section[]>
  selectedFieldId: Ref<string | null>
  undoStack: Ref<UndoCommand[]>
  redoStack: Ref<UndoCommand[]>
  isDirty: Ref<boolean>
  templateId: Ref<number>
  templateName: Ref<string>
  templateDescription: Ref<string>
  fieldDialogOpen: Ref<boolean>
  fieldDialogType: Ref<FieldType | null>
  fieldDialogColumnId: Ref<string | null>
  fieldDialogLabel: Ref<string>
  fieldDialogDescription: Ref<string>
  fieldDialogRequired: Ref<boolean>
  loadTemplate: (id: number | string) => Promise<void>
  addSection: (display?: 'tabs' | 'accordion' | 'default') => void
  removeSection: (id: string) => void
  addRow: (sectionId: string) => void
  removeRow: (rowId: string) => void
  addColumn: (rowId: string) => void
  addField: (columnId: string, type: FieldType, config?: { label?: string; description?: string; required?: boolean }) => void
  removeField: (fieldId: string) => void
  updateField: (fieldId: string, config: Partial<FieldConfig>) => void
  reorderSections: (order: string[]) => void
  moveField: (fieldId: string, targetColumnId: string) => void
  undo: () => void
  redo: () => void
  saveTemplate: () => Promise<any>
  openFieldDialog: (columnId: string, type: FieldType) => void
  confirmFieldDialog: () => void
  cancelFieldDialog: () => void
}

const MAX_STACK = 50

/** Injection key for provide/inject pattern */
export const BUILDER_KEY = Symbol('templateBuilder')

// ============================================================================
// Helpers
// ============================================================================

function generateId(): string {
  return crypto.randomUUID()
}

function findFieldById(
  sections: Section[],
  fieldId: string
): { section: Section; row: Row; column: Column; field: FieldConfig; index: number } | null {
  for (const section of sections) {
    for (const row of section.rows) {
      for (const column of row.columns) {
        const index = column.fields.findIndex((f) => f.id === fieldId)
        if (index !== -1) {
          return { section, row, column, field: column.fields[index], index }
        }
      }
    }
  }
  return null
}

function findSectionByRowId(sections: Section[], rowId: string): Section | null {
  for (const section of sections) {
    if (section.rows.some((r) => r.id === rowId)) return section
  }
  return null
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
}

function isDuplicateKey(sections: Section[], fieldId: string, newKey: string): boolean {
  for (const section of sections) {
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
  return false
}

function pushCommand(stack: Ref<UndoCommand[]>, cmd: UndoCommand): void {
  stack.value.push(cmd)
  if (stack.value.length > MAX_STACK) {
    stack.value.shift()
  }
}

function createField(type: FieldType): FieldConfig {
  const field: FieldConfig = {
    id: generateId(),
    type,
    label: type,
    key: slugify(type),
    required: false,
  }
  if (type === 'select' || type === 'radio' || type === 'checkbox') {
    field.options = []
  }
  if (type === 'dynamic_table') {
    field.columns = []
  }
  return field
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
  const templateId: Ref<number> = ref(0)
  const templateName: Ref<string> = ref('')
  const templateDescription: Ref<string> = ref('')

  const fieldDialogOpen: Ref<boolean> = ref(false)
  const fieldDialogType: Ref<FieldType | null> = ref(null)
  const fieldDialogColumnId: Ref<string | null> = ref(null)
  const fieldDialogLabel: Ref<string> = ref('')
  const fieldDialogDescription: Ref<string> = ref('')
  const fieldDialogRequired: Ref<boolean> = ref(false)

  // ---- Mutations ----

  function addSection(display: 'tabs' | 'accordion' | 'default' = 'default'): void {
    const id = generateId()
    const section: Section = { id, label: 'Nueva sección', display, rows: [] }
    sections.value.push(section)
    isDirty.value = true
    redoStack.value = []

    pushCommand(undoStack, {
      type: 'addSection',
      payload: { id },
      forward: () => {
        sections.value.push(section)
      },
      inverse: () => {
        sections.value = sections.value.filter((s) => s.id !== id)
      },
    })
  }

  function removeSection(id: string): void {
    const index = sections.value.findIndex((s) => s.id === id)
    if (index === -1) return
    const removed = sections.value[index]
    sections.value = sections.value.filter((s) => s.id !== id)
    if (selectedFieldId.value === id) selectedFieldId.value = null
    isDirty.value = true
    redoStack.value = []

    pushCommand(undoStack, {
      type: 'removeSection',
      payload: { index, section: JSON.parse(JSON.stringify(removed)) },
      forward: () => {
        sections.value.splice(index, 0, removed)
      },
      inverse: () => {
        sections.value = sections.value.filter((s) => s.id !== id)
      },
    })
  }

  function addRow(sectionId: string): void {
    const section = sections.value.find((s) => s.id === sectionId)
    if (!section) return

    const rowId = generateId()
    const colId = generateId()
    const row: Row = {
      id: rowId,
      columns: [{ id: colId, fields: [] }],
    }
    section.rows.push(row)
    isDirty.value = true
    redoStack.value = []

    pushCommand(undoStack, {
      type: 'addRow',
      payload: { sectionId, rowId },
      forward: () => {
        const sec = sections.value.find((s) => s.id === sectionId)
        if (sec) sec.rows.push(row)
      },
      inverse: () => {
        const sec = sections.value.find((s) => s.id === sectionId)
        if (sec) sec.rows = sec.rows.filter((r) => r.id !== rowId)
      },
    })
  }

  function removeRow(rowId: string): void {
    const section = findSectionByRowId(sections.value, rowId)
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
        const sec = sections.value.find((s) => s.id === section.id)
        if (sec) sec.rows.splice(index, 0, removed)
      },
      inverse: () => {
        const sec = sections.value.find((s) => s.id === section.id)
        if (sec) sec.rows = sec.rows.filter((r) => r.id !== rowId)
      },
    })
  }

  function addColumn(rowId: string): void {
    const row = sections.value.flatMap((s) => s.rows).find((r) => r.id === rowId)
    if (!row) return

    const colId = generateId()
    const column: Column = { id: colId, fields: [] }
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

  function addField(columnId: string, type: FieldType, config?: { label?: string; description?: string; required?: boolean }): void {
    const column = sections.value
      .flatMap((s) => s.rows)
      .flatMap((r) => r.columns)
      .find((c) => c.id === columnId)
    if (!column) return

    const field = createField(type)
    if (config?.label) {
      field.label = config.label
      field.key = slugify(config.label) || slugify(type)
    }
    if (config?.description) {
      field.placeholder = config.description
    }
    if (config?.required !== undefined) {
      field.required = config.required
    }
    column.fields.push(field)
    selectedFieldId.value = field.id
    isDirty.value = true
    redoStack.value = []

    pushCommand(undoStack, {
      type: 'addField',
      payload: { columnId, fieldId: field.id },
      forward: () => {
        column.fields.push(field)
      },
      inverse: () => {
        column.fields = column.fields.filter((f) => f.id !== field.id)
      },
    })
  }

  function openFieldDialog(columnId: string, type: FieldType): void {
    fieldDialogColumnId.value = columnId
    fieldDialogType.value = type
    fieldDialogLabel.value = ''
    fieldDialogDescription.value = ''
    fieldDialogRequired.value = false
    fieldDialogOpen.value = true
  }

  function confirmFieldDialog(): void {
    if (!fieldDialogColumnId.value || !fieldDialogType.value) return
    addField(fieldDialogColumnId.value, fieldDialogType.value, {
      label: fieldDialogLabel.value,
      description: fieldDialogDescription.value,
      required: fieldDialogRequired.value,
    })
    fieldDialogOpen.value = false
    fieldDialogColumnId.value = null
    fieldDialogType.value = null
  }

  function cancelFieldDialog(): void {
    fieldDialogOpen.value = false
    fieldDialogColumnId.value = null
    fieldDialogType.value = null
  }

  function removeField(fieldId: string): void {
    const found = findFieldById(sections.value, fieldId)
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
        column.fields.splice(index, 0, removed)
      },
      inverse: () => {
        column.fields = column.fields.filter((f) => f.id !== fieldId)
      },
    })
  }

  function updateField(fieldId: string, config: Partial<FieldConfig>): void {
    const found = findFieldById(sections.value, fieldId)
    if (!found) return
    const { field } = found

    // Duplicate key validation
    if (config.key !== undefined && config.key !== field.key) {
      if (isDuplicateKey(sections.value, fieldId, config.key)) {
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
    if (order.length !== sections.value.length) return
    const map = new Map(sections.value.map((s) => [s.id, s]))
    const reordered = order.map((id) => map.get(id)).filter(Boolean) as Section[]
    if (reordered.length !== sections.value.length) return
    sections.value = reordered
    isDirty.value = true
  }

  function moveField(fieldId: string, targetColumnId: string): void {
    const found = findFieldById(sections.value, fieldId)
    if (!found) return
    const { column, index } = found
    const field = column.fields[index]

    const targetColumn = sections.value
      .flatMap((s) => s.rows)
      .flatMap((r) => r.columns)
      .find((c) => c.id === targetColumnId)
    if (!targetColumn) return

    column.fields.splice(index, 1)
    targetColumn.fields.push(field)
    isDirty.value = true
    redoStack.value = []

    pushCommand(undoStack, {
      type: 'moveField',
      payload: { fieldId, fromColumnId: column.id, targetColumnId },
      forward: () => {
        targetColumn.fields.push(field)
      },
      inverse: () => {
        targetColumn.fields = targetColumn.fields.filter((f) => f.id !== fieldId)
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
    sections.value = data.structure?.sections ?? []
    templateName.value = data.name ?? ''
    templateDescription.value = data.description ?? ''
    templateId.value = data.id ?? 0
    isDirty.value = false
    undoStack.value = []
    redoStack.value = []
    selectedFieldId.value = null
  }

  async function saveTemplate(): Promise<any> {
    const authStore = useAuthStore()
    if (!authStore.hasPermission('admin.reporttemplate.update')) {
      throw new Error('No tiene permiso para guardar plantillas de informe')
    }

    const payload = {
      name: templateName.value,
      description: templateDescription.value,
      structure: { sections: sections.value },
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
    return result
  }

  return reactive({
    sections,
    selectedFieldId,
    undoStack,
    redoStack,
    isDirty,
    templateId,
    templateName,
    templateDescription,
    fieldDialogOpen,
    fieldDialogType,
    fieldDialogColumnId,
    fieldDialogLabel,
    fieldDialogDescription,
    fieldDialogRequired,
    loadTemplate,
    addSection,
    removeSection,
    addRow,
    removeRow,
    addColumn,
    addField,
    removeField,
    updateField,
    reorderSections,
    moveField,
    undo,
    redo,
    saveTemplate,
    openFieldDialog,
    confirmFieldDialog,
    cancelFieldDialog,
  }) as unknown as UseTemplateBuilderReturn
}
