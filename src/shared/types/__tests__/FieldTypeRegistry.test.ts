import { describe, it, expect } from 'vitest'
import { FieldTypeRegistry, createFieldFromMeta } from '../FieldTypeRegistry'
import type { FieldTypeMeta } from '../FieldTypeMeta'

function makeMeta(overrides: Partial<FieldTypeMeta> = {}): FieldTypeMeta {
  return {
    type: 'text',
    label: 'Texto Corto',
    icon: 'pi pi-pencil',
    group: 'text',
    description: 'Campo de texto corto',
    defaultFactory: () => ({
      id: '1',
      type: 'text' as const,
      label: 'Texto Corto',
      key: 'texto_corto',
      required: false,
    }),
    allowedProperties: ['id', 'type', 'label', 'key', 'required', 'ai_help_description', 'max_chars', 'placeholder', 'default_value'],
    ...overrides,
  }
}

describe('FieldTypeRegistry', () => {
  it('starts empty', () => {
    const reg = new FieldTypeRegistry()
    expect(reg.size).toBe(0)
    expect(reg.getAll()).toEqual([])
  })

  it('registers a field type', () => {
    const reg = new FieldTypeRegistry()
    reg.register(makeMeta())
    expect(reg.size).toBe(1)
    expect(reg.has('text')).toBe(true)
  })

  it('throws when registering duplicate type', () => {
    const reg = new FieldTypeRegistry()
    reg.register(makeMeta())
    expect(() => reg.register(makeMeta())).toThrow(/already registered/)
  })

  it('gets metadata by type', () => {
    const reg = new FieldTypeRegistry()
    const meta = makeMeta({ type: 'number', label: 'Número' })
    reg.register(meta)
    expect(reg.get('number')?.label).toBe('Número')
    expect(reg.get('text')).toBeUndefined()
  })

  it('unregisters a type', () => {
    const reg = new FieldTypeRegistry()
    reg.register(makeMeta())
    reg.unregister('text')
    expect(reg.size).toBe(0)
    expect(reg.has('text')).toBe(false)
  })

  it('groups types by group', () => {
    const reg = new FieldTypeRegistry()
    reg.register(makeMeta({ type: 'text', group: 'text' }))
    reg.register(makeMeta({ type: 'number', group: 'text' }))
    reg.register(makeMeta({ type: 'select', group: 'selection' }))

    const grouped = reg.getGrouped()
    expect(grouped.get('text')).toHaveLength(2)
    expect(grouped.get('selection')).toHaveLength(1)
  })

  it('validates config: allows known properties', () => {
    const reg = new FieldTypeRegistry()
    reg.register(makeMeta({ type: 'text' }))

    const config = { id: '1', type: 'text' as const, label: 'Test', key: 'test', required: false, placeholder: 'Hey' }
    const unknown = reg.validateConfig(config)
    expect(unknown).toEqual([])
  })

  it('validates config: rejects unknown properties', () => {
    const reg = new FieldTypeRegistry()
    reg.register(makeMeta({ type: 'text' }))

    const config = { id: '1', type: 'text' as const, label: 'Test', key: 'test', required: false, unknownProp: 'bad' } as any
    const unknown = reg.validateConfig(config)
    expect(unknown).toContain('unknownProp')
  })

  it('validates config: returns error for unregistered type', () => {
    const reg = new FieldTypeRegistry()
    const config = { id: '1', type: 'unknown_type' as any, label: 'Test', key: 'test', required: false }
    const unknown = reg.validateConfig(config)
    expect(unknown).toEqual(['__unknown_type__'])
  })

  it('createFieldFromMeta uses defaultFactory', () => {
    const meta = makeMeta()
    const field = createFieldFromMeta(meta)
    expect(field.type).toBe('text')
    expect(field.label).toBe('Texto Corto')
  })
})
