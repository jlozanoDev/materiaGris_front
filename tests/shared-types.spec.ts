import { describe, it, expect } from 'vitest'
import type {
  FieldType,
  FieldOption,
  ConditionalRule,
  FieldConfig,
  Column,
  Row,
  Section,
  ReportTemplate,
  ReportStatus,
  PatientReport,
} from '@/shared/types/index'

describe('Shared Types — Report Template Structure', () => {
  it('FieldType union accepts all valid field type literals', () => {
    const types: FieldType[] = [
      'text',
      'textarea',
      'number',
      'date',
      'select',
      'radio',
      'checkbox',
      'dynamic_table',
      'signature',
    ]
    expect(types).toHaveLength(9)
    types.forEach((t) => expect(typeof t).toBe('string'))
  })

  it('FieldOption has label and value strings', () => {
    const option: FieldOption = { label: 'Sí', value: 'yes' }
    expect(option.label).toBe('Sí')
    expect(option.value).toBe('yes')
  })

  it('ConditionalRule enforces operator whitelist via union', () => {
    const rule: ConditionalRule = {
      field: 'genero',
      op: '==',
      value: 'Femenino',
    }
    expect(rule.field).toBe('genero')
    expect(rule.op).toBe('==')
    expect(rule.value).toBe('Femenino')
  })

  it('ConditionalRule supports all operators', () => {
    const operators: ConditionalRule['op'][] = [
      '==', '!=', 'contains', '>', '<', '>=', '<=',
    ]
    expect(operators).toHaveLength(7)
  })

  it('FieldConfig with full properties', () => {
    const config: FieldConfig = {
      id: 'field-1',
      type: 'text',
      label: 'Nombre',
      key: 'nombre',
      placeholder: 'Ingrese su nombre',
      required: true,
      systemVariable: '{{paciente.nombre_completo}}',
      options: [{ label: 'A', value: 'a' }],
      conditionalRule: { field: 'genero', op: '==', value: 'Femenino' },
    }
    expect(config.id).toBe('field-1')
    expect(config.type).toBe('text')
    expect(config.label).toBe('Nombre')
    expect(config.key).toBe('nombre')
    expect(config.placeholder).toBe('Ingrese su nombre')
    expect(config.required).toBe(true)
    expect(config.systemVariable).toBe('{{paciente.nombre_completo}}')
    expect(config.options).toHaveLength(1)
    expect(config.conditionalRule?.op).toBe('==')
  })

  it('FieldConfig defaults required to undefined when omitted', () => {
    const config: FieldConfig = {
      id: 'f1',
      type: 'textarea',
      label: 'Notas',
      key: 'notas',
    }
    expect(config.required).toBeUndefined()
  })

  it('Column with nested fields', () => {
    const col: Column = {
      id: 'col-1',
      label: 'Principal',
      width: 6,
      fields: [
        { id: 'f1', type: 'text', label: 'Campo 1', key: 'campo_1' },
      ],
    }
    expect(col.id).toBe('col-1')
    expect(col.label).toBe('Principal')
    expect(col.width).toBe(6)
    expect(col.fields).toHaveLength(1)
    expect(col.fields[0].key).toBe('campo_1')
  })

  it('Column width is optional', () => {
    const col: Column = {
      id: 'c1',
      label: 'Auto',
      fields: [],
    }
    expect(col.width).toBeUndefined()
  })

  it('Row contains columns', () => {
    const row: Row = {
      id: 'row-1',
      columns: [
        {
          id: 'col-1',
          label: 'Col A',
          fields: [{ id: 'f1', type: 'date', label: 'Fecha', key: 'fecha' }],
        },
      ],
    }
    expect(row.id).toBe('row-1')
    expect(row.columns).toHaveLength(1)
    expect(row.columns[0].fields[0].type).toBe('date')
  })

  it('ReportTemplate with nested structure', () => {
    const template: ReportTemplate = {
      id: 'tpl-1',
      name: 'Informe Cardiológico',
      description: 'Evaluación cardíaca completa',
      isActive: true,
      structure: {
        sections: [
          {
            id: 's1',
            label: 'Signos Vitales',
            display: 'default',
            rows: [],
          },
        ],
      },
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-02T00:00:00Z',
    }
    expect(template.name).toBe('Informe Cardiológico')
    expect(template.isActive).toBe(true)
    expect(template.structure.sections).toHaveLength(1)
    expect(template.createdAt).toBe('2025-01-01T00:00:00Z')
  })

  it('ReportTemplate timestamps are optional', () => {
    const template: ReportTemplate = {
      id: 't1',
      name: 'Simple',
      description: '',
      isActive: false,
      structure: { sections: [] },
    }
    expect(template.createdAt).toBeUndefined()
    expect(template.updatedAt).toBeUndefined()
  })

  it('ReportStatus union accepts draft, signed, closed', () => {
    const statuses: ReportStatus[] = ['draft', 'signed', 'closed']
    expect(statuses).toHaveLength(3)
  })

  it('PatientReport with full snapshot and values', () => {
    const report: PatientReport = {
      id: 'rpt-1',
      patientId: 'pat-42',
      userId: 'usr-7',
      status: 'draft',
      templateStructureSnapshot: {
        sections: [
          {
            id: 's1',
            label: 'Datos',
            display: 'default',
            rows: [],
          },
        ],
      },
      values: { nombre: 'Juan', edad: '30' },
      createdAt: '2025-06-01T10:00:00Z',
      updatedAt: '2025-06-01T10:05:00Z',
    }
    expect(report.patientId).toBe('pat-42')
    expect(report.userId).toBe('usr-7')
    expect(report.status).toBe('draft')
    expect(report.templateStructureSnapshot.sections).toHaveLength(1)
    expect(report.values.nombre).toBe('Juan')
  })

  it('dynamic_table field config with column definitions', () => {
    const config: FieldConfig = {
      id: 'dt-1',
      type: 'dynamic_table',
      label: 'Medicación',
      key: 'medicacion',
      columns: [
        { name: 'Medicamento', type: 'text' },
        { name: 'Dosis', type: 'number' },
        { name: 'Frecuencia', type: 'select' },
      ],
    }
    expect(config.columns).toHaveLength(3)
    expect(config.columns?.[0].name).toBe('Medicamento')
    expect(config.columns?.[1].type).toBe('number')
  })
})
