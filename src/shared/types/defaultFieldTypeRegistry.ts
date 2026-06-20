import { FieldTypeRegistry } from './FieldTypeRegistry'
import type { FieldTypeMeta } from './FieldTypeMeta'

/**
 * Build and return the default FieldTypeRegistry with all 10 field types.
 */
export function createDefaultFieldTypeRegistry(): FieldTypeRegistry {
  const registry = new FieldTypeRegistry()

  const textMeta: FieldTypeMeta = {
    type: 'text',
    label: 'Texto Corto',
    icon: 'pi pi-pencil',
    group: 'text',
    description: 'Campo de texto de una línea',
    defaultFactory: () => ({
      id: crypto.randomUUID(),
      type: 'text',
      label: 'Nuevo campo',
      key: 'nuevo_campo',
      required: false,
    }),
    allowedProperties: ['id', 'type', 'label', 'key', 'required', 'ai_help_description', 'showLabel', 'max_chars', 'placeholder', 'default_value'],
  }

  const textareaMeta: FieldTypeMeta = {
    ...textMeta,
    type: 'textarea',
    label: 'Texto Largo',
    icon: 'pi pi-align-left',
    description: 'Campo de texto multilínea',
    defaultFactory: () => ({
      id: crypto.randomUUID(),
      type: 'textarea',
      label: 'Nuevo campo',
      key: 'nuevo_campo',
      required: false,
    }),
  }

  const numberMeta: FieldTypeMeta = {
    type: 'number',
    label: 'Número',
    icon: 'pi pi-hashtag',
    group: 'text',
    description: 'Campo numérico',
    defaultFactory: () => ({
      id: crypto.randomUUID(),
      type: 'number',
      label: 'Nuevo campo',
      key: 'nuevo_campo',
      required: false,
    }),
    allowedProperties: ['id', 'type', 'label', 'key', 'required', 'ai_help_description', 'showLabel', 'decimals', 'min', 'max', 'default_value'],
  }

  const dateMeta: FieldTypeMeta = {
    type: 'date',
    label: 'Fecha',
    icon: 'pi pi-calendar',
    group: 'text',
    description: 'Campo de fecha',
    defaultFactory: () => ({
      id: crypto.randomUUID(),
      type: 'date',
      label: 'Nuevo campo',
      key: 'nuevo_campo',
      required: false,
    }),
    allowedProperties: ['id', 'type', 'label', 'key', 'required', 'ai_help_description', 'showLabel', 'min_date', 'max_date', 'placeholder', 'default_value'],
  }

  const selectMeta: FieldTypeMeta = {
    type: 'select',
    label: 'Selección',
    icon: 'pi pi-check',
    group: 'selection',
    description: 'Lista desplegable',
    defaultFactory: () => ({
      id: crypto.randomUUID(),
      type: 'select',
      label: 'Nuevo campo',
      key: 'nuevo_campo',
      required: false,
      options: [],
    }),
    allowedProperties: ['id', 'type', 'label', 'key', 'required', 'ai_help_description', 'showLabel', 'options', 'placeholder', 'default_value'],
  }

  const multiSelectMeta: FieldTypeMeta = {
    ...selectMeta,
    type: 'multi_select',
    label: 'Selección Múltiple',
    icon: 'pi pi-list',
    description: 'Lista de selección múltiple',
  }

  const radioMeta: FieldTypeMeta = {
    ...selectMeta,
    type: 'radio',
    label: 'Opción Única',
    icon: 'pi pi-chevron-circle-down',
    description: 'Grupo de opciones únicas',
  }

  const checkboxMeta: FieldTypeMeta = {
    ...selectMeta,
    type: 'checkbox',
    label: 'Checkbox',
    icon: 'pi pi-check-square',
    description: 'Grupo de checkboxes',
  }

  const fixedTextMeta: FieldTypeMeta = {
    type: 'fixed_text',
    label: 'Texto Fijo',
    icon: 'pi pi-file',
    group: 'special',
    description: 'Texto informativo con variables del sistema',
    defaultFactory: () => ({
      id: crypto.randomUUID(),
      type: 'fixed_text',
      label: 'Texto Fijo',
      key: 'texto_fijo',
      required: false,
      text_content: '',
    }),
    allowedProperties: ['id', 'type', 'label', 'key', 'required', 'ai_help_description', 'showLabel', 'text_content', 'styling_options'],
  }

  const dynamicTableMeta: FieldTypeMeta = {
    type: 'dynamic_table',
    label: 'Tabla Dinámica',
    icon: 'pi pi-table',
    group: 'special',
    description: 'Tabla editable con columnas configurables',
    defaultFactory: () => ({
      id: crypto.randomUUID(),
      type: 'dynamic_table',
      label: 'Nuevo campo',
      key: 'nuevo_campo',
      required: false,
      columns: [],
    }),
    allowedProperties: ['id', 'type', 'label', 'key', 'required', 'ai_help_description', 'showLabel', 'columns', 'footer_totals'],
  }

  const verticalSeparatorMeta: FieldTypeMeta = {
    type: 'vertical_separator',
    label: 'Separador Vertical',
    icon: 'pi pi-minus vertical-separator-icon',
    group: 'special',
    description: 'Línea vertical separadora entre columnas',
    defaultFactory: () => ({
      id: crypto.randomUUID(),
      type: 'vertical_separator',
      label: '',
      key: 'separador',
      required: false,
      showLabel: false,
    }),
    allowedProperties: ['id', 'type', 'label', 'key'],
  }

  const horizontalSeparatorMeta: FieldTypeMeta = {
    type: 'horizontal_separator',
    label: 'Separador Horizontal',
    icon: 'pi pi-minus',
    group: 'special',
    description: 'Línea horizontal separadora entre filas',
    defaultFactory: () => ({
      id: crypto.randomUUID(),
      type: 'horizontal_separator',
      label: '',
      key: 'separador_horizontal',
      required: false,
      showLabel: false,
    }),
    allowedProperties: ['id', 'type', 'label', 'key'],
  }

  const signatureMeta: FieldTypeMeta = {
    type: 'signature',
    label: 'Firma',
    icon: 'pi pi-pencil',
    group: 'special',
    description: 'Campo de firma manuscrita o mecanografiada',
    defaultFactory: () => ({
      id: crypto.randomUUID(),
      type: 'signature',
      label: 'Firma',
      key: '_signature',
      required: true,
    }),
    allowedProperties: ['id', 'type', 'label', 'key', 'required'],
  }

  registry.register(textMeta)
  registry.register(textareaMeta)
  registry.register(numberMeta)
  registry.register(dateMeta)
  registry.register(selectMeta)
  registry.register(multiSelectMeta)
  registry.register(radioMeta)
  registry.register(checkboxMeta)
  registry.register(fixedTextMeta)
  registry.register(dynamicTableMeta)
  registry.register(verticalSeparatorMeta)
  registry.register(horizontalSeparatorMeta)
  registry.register(signatureMeta)

  return registry
}
