import type { Section, FieldConfig } from '@/shared/types'

const EXAMPLE_TEXTS: Record<string, string> = {
  text: 'Texto de ejemplo',
  textarea: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.\n\nSegundo párrafo de ejemplo con más contenido.',
  number: '42',
  date: new Date().toISOString().slice(0, 10),
}

function generateForField(field: FieldConfig): unknown {
  switch (field.type) {
    case 'text':
      return field.default_value ?? EXAMPLE_TEXTS.text

    case 'textarea':
      return field.default_value ?? EXAMPLE_TEXTS.textarea

    case 'number': {
      if (field.default_value !== undefined) return field.default_value
      const min = field.min ?? 1
      const max = field.max ?? 100
      const value = Math.floor(Math.random() * (max - min + 1)) + min
      return field.decimals !== undefined ? parseFloat(value.toFixed(field.decimals)) : value
    }

    case 'date':
      return field.default_value ?? EXAMPLE_TEXTS.date

    case 'select':
      return field.default_value ?? field.options?.[0]?.value ?? ''

    case 'radio':
      return field.default_value ?? field.options?.[0]?.value ?? ''

    case 'multi_select':
      return field.default_value ?? (field.options?.[0] ? [field.options[0].value] : [])

    case 'checkbox':
      return field.default_value ?? (field.options?.[0] ? [field.options[0].value] : [])

    case 'fixed_text':
      return ''

    case 'vertical_separator':
      return ''

    case 'horizontal_separator':
      return ''

    case 'dynamic_table': {
      const rows: Record<string, any>[] = [
        generateTableRow(field),
        generateTableRow(field),
      ]
      return rows
    }

    default:
      return ''
  }
}

function generateTableRow(field: FieldConfig): Record<string, any> {
  if (field.type !== 'dynamic_table') return {}
  const row: Record<string, any> = {}
  for (const col of field.columns || []) {
    switch (col.type) {
      case 'text':
        row[col.key] = `Ejemplo ${col.label.toLowerCase()}`
        break
      case 'number':
        row[col.key] = Math.floor(Math.random() * 100) + 1
        break
      case 'date':
        row[col.key] = EXAMPLE_TEXTS.date
        break
      case 'select':
        row[col.key] = col.options?.[0]?.value ?? ''
        break
      default:
        row[col.key] = ''
    }
  }
  return row
}

export function generateExampleData(sections: Section[]): Record<string, any> {
  const data: Record<string, any> = {}

  for (const section of sections) {
    for (const row of section.rows) {
      for (const col of row.columns) {
        for (const field of col.fields) {
          data[field.key] = generateForField(field)
        }
      }
    }
  }

  return data
}
