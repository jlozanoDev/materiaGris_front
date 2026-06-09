import { describe, it, expect, vi } from 'vitest'
import { evaluateCondition, computeFieldVisibility } from '../ConditionalLogicEngine'
import type { ConditionalRule, FieldConfig } from '@/shared/types/index'

// ============================================================================
// evaluateCondition
// ============================================================================

describe('evaluateCondition', () => {
  // --- Equality (==) ---
  it('returns true when field value equals rule value (==)', () => {
    const rule: ConditionalRule = { field: 'genero', op: '==', value: 'Femenino' }
    const scope = { genero: 'Femenino' }
    expect(evaluateCondition(rule, scope)).toBe(true)
  })

  it('returns false when field value differs from rule value (==)', () => {
    const rule: ConditionalRule = { field: 'genero', op: '==', value: 'Femenino' }
    const scope = { genero: 'Masculino' }
    expect(evaluateCondition(rule, scope)).toBe(false)
  })

  // --- Inequality (!=) ---
  it('returns true when field value differs from rule value (!=)', () => {
    const rule: ConditionalRule = { field: 'tipo_documento', op: '!=', value: 'DNI' }
    const scope = { tipo_documento: 'Pasaporte' }
    expect(evaluateCondition(rule, scope)).toBe(true)
  })

  it('returns false when field value equals rule value (!=)', () => {
    const rule: ConditionalRule = { field: 'tipo_documento', op: '!=', value: 'DNI' }
    const scope = { tipo_documento: 'DNI' }
    expect(evaluateCondition(rule, scope)).toBe(false)
  })

  // --- Contains ---
  it('returns true when scope value contains rule value (contains)', () => {
    const rule: ConditionalRule = { field: 'antecedentes', op: 'contains', value: 'alergias' }
    const scope = { antecedentes: 'hipertensión, alergias, diabetes' }
    expect(evaluateCondition(rule, scope)).toBe(true)
  })

  it('returns false when scope value does not contain rule value (contains)', () => {
    const rule: ConditionalRule = { field: 'antecedentes', op: 'contains', value: 'alergias' }
    const scope = { antecedentes: 'sin antecedentes relevantes' }
    expect(evaluateCondition(rule, scope)).toBe(false)
  })

  // --- Greater than (>) ---
  it('returns true when scope value is greater than rule value (>)', () => {
    const rule: ConditionalRule = { field: 'edad', op: '>', value: '65' }
    const scope = { edad: '70' }
    expect(evaluateCondition(rule, scope)).toBe(true)
  })

  it('returns false when scope value is less than rule value (>)', () => {
    const rule: ConditionalRule = { field: 'edad', op: '>', value: '65' }
    const scope = { edad: '42' }
    expect(evaluateCondition(rule, scope)).toBe(false)
  })

  it('returns false when scope value equals rule value (>)', () => {
    const rule: ConditionalRule = { field: 'edad', op: '>', value: '65' }
    const scope = { edad: '65' }
    expect(evaluateCondition(rule, scope)).toBe(false)
  })

  // --- Less than (<) ---
  it('returns true when scope value is less than rule value (<)', () => {
    const rule: ConditionalRule = { field: 'peso', op: '<', value: '100' }
    const scope = { peso: '80' }
    expect(evaluateCondition(rule, scope)).toBe(true)
  })

  it('returns false when scope value is greater than rule value (<)', () => {
    const rule: ConditionalRule = { field: 'peso', op: '<', value: '100' }
    const scope = { peso: '120' }
    expect(evaluateCondition(rule, scope)).toBe(false)
  })

  // --- Greater or equal (>=) ---
  it('returns true when scope value equals rule value (>=)', () => {
    const rule: ConditionalRule = { field: 'edad', op: '>=', value: '65' }
    const scope = { edad: '65' }
    expect(evaluateCondition(rule, scope)).toBe(true)
  })

  it('returns true when scope value is greater than rule value (>=)', () => {
    const rule: ConditionalRule = { field: 'edad', op: '>=', value: '65' }
    const scope = { edad: '70' }
    expect(evaluateCondition(rule, scope)).toBe(true)
  })

  it('returns false when scope value is less than rule value (>=)', () => {
    const rule: ConditionalRule = { field: 'edad', op: '>=', value: '65' }
    const scope = { edad: '42' }
    expect(evaluateCondition(rule, scope)).toBe(false)
  })

  // --- Less or equal (<=) ---
  it('returns true when scope value equals rule value (<=)', () => {
    const rule: ConditionalRule = { field: 'presion', op: '<=', value: '120' }
    const scope = { presion: '120' }
    expect(evaluateCondition(rule, scope)).toBe(true)
  })

  it('returns true when scope value is less than rule value (<=)', () => {
    const rule: ConditionalRule = { field: 'presion', op: '<=', value: '120' }
    const scope = { presion: '100' }
    expect(evaluateCondition(rule, scope)).toBe(true)
  })

  it('returns false when scope value is greater than rule value (<=)', () => {
    const rule: ConditionalRule = { field: 'presion', op: '<=', value: '120' }
    const scope = { presion: '140' }
    expect(evaluateCondition(rule, scope)).toBe(false)
  })

  // --- Numeric coercion (both scope and rule are numeric strings) ---
  it('coerces numeric strings to numbers for comparison operators (>=)', () => {
    const rule: ConditionalRule = { field: 'edad', op: '>=', value: '65' }
    const scope = { edad: 65 } // number in scope
    expect(evaluateCondition(rule, scope)).toBe(true)
  })

  it('coerces numeric strings to numbers for comparison operators (>)', () => {
    const rule: ConditionalRule = { field: 'edad', op: '>', value: '65' }
    const scope = { edad: '70' }
    expect(evaluateCondition(rule, scope)).toBe(true)
  })

  // --- String comparison for == / != / contains (non-numeric) ---
  it('uses string comparison for == when values are non-numeric', () => {
    const rule: ConditionalRule = { field: 'nombre', op: '==', value: 'Juan' }
    const scope = { nombre: 'Juan' }
    expect(evaluateCondition(rule, scope)).toBe(true)
  })

  it('uses string comparison for contains even with numeric-looking substrings', () => {
    const rule: ConditionalRule = { field: 'codigo', op: 'contains', value: '42' }
    const scope = { codigo: 'ID-4242-X' }
    expect(evaluateCondition(rule, scope)).toBe(true)
  })

  // --- Missing field in scope (fail-open) ---
  it('returns true when referenced field is missing (fail-open)', () => {
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const rule: ConditionalRule = { field: 'campo_inexistente', op: '==', value: 'x' }
    const scope = { otro: 'y' }
    expect(evaluateCondition(rule, scope)).toBe(true)
    expect(consoleWarn).toHaveBeenCalledWith(
      expect.stringContaining("Referenced field 'campo_inexistente' not found")
    )
    consoleWarn.mockRestore()
  })

  // --- Security: malicious inputs treated as plain strings ---
  it('treats __proto__ as plain string, not prototype pollution', () => {
    const rule: ConditionalRule = { field: 'injected', op: '==', value: '__proto__' }
    const scope = { injected: '__proto__' }
    expect(evaluateCondition(rule, scope)).toBe(true)
  })

  it('treats constructor as plain string', () => {
    const rule: ConditionalRule = { field: 'x', op: '==', value: 'constructor' }
    const scope = { x: 'constructor' }
    expect(evaluateCondition(rule, scope)).toBe(true)
  })

  it('treats injection-style strings as plain strings', () => {
    const rule: ConditionalRule = { field: 'x', op: '!=', value: '"; alert(1); //' }
    const scope = { x: 'safe' }
    expect(evaluateCondition(rule, scope)).toBe(true)
  })

  // --- Pure function: no side effects ---
  it('does not mutate the scope object (pure function)', () => {
    const rule: ConditionalRule = { field: 'edad', op: '>', value: '18' }
    const scope = { edad: '25' }
    const scopeCopy = { ...scope }
    evaluateCondition(rule, scope)
    expect(scope).toEqual(scopeCopy)
  })

  it('does not mutate the rule object (pure function)', () => {
    const rule: ConditionalRule = { field: 'edad', op: '>', value: '18' }
    const scope = { edad: '25' }
    const ruleCopy = { ...rule }
    evaluateCondition(rule, scope)
    expect(rule).toEqual(ruleCopy)
  })
})

// ============================================================================
// computeFieldVisibility
// ============================================================================

describe('computeFieldVisibility', () => {
  it('all fields visible when no conditional rules exist', () => {
    const fields: FieldConfig[] = [
      { id: 'f1', type: 'text', label: 'Nombre', key: 'nombre' },
      { id: 'f2', type: 'date', label: 'Fecha', key: 'fecha' },
    ]
    const result = computeFieldVisibility(fields, {})
    expect(result).toEqual({ f1: true, f2: true })
  })

  it('hides field when condition evaluates to false', () => {
    const fields: FieldConfig[] = [
      { id: 'f1', type: 'text', label: 'Nombre', key: 'nombre' },
      {
        id: 'f2',
        type: 'textarea',
        label: 'Notas embarazo',
        key: 'notas_embarazo',
        conditionalRule: { field: 'genero', op: '==', value: 'Femenino' },
      },
    ]
    const result = computeFieldVisibility(fields, { genero: 'Masculino' })
    expect(result.f1).toBe(true)
    expect(result.f2).toBe(false)
  })

  it('shows field when condition evaluates to true', () => {
    const fields: FieldConfig[] = [
      {
        id: 'f1',
        type: 'textarea',
        label: 'Notas embarazo',
        key: 'notas_embarazo',
        conditionalRule: { field: 'genero', op: '==', value: 'Femenino' },
      },
    ]
    const result = computeFieldVisibility(fields, { genero: 'Femenino' })
    expect(result.f1).toBe(true)
  })

  it('uses field id as key in visibility map', () => {
    const fields: FieldConfig[] = [
      { id: 'a', type: 'text', label: 'A', key: 'key_a' },
      { id: 'b', type: 'text', label: 'B', key: 'key_b' },
    ]
    const result = computeFieldVisibility(fields, {})
    expect(Object.keys(result)).toEqual(['a', 'b'])
  })

  // --- Circular dependency detection (fail-open) ---
  it('detects circular dependency and fails open (both visible)', () => {
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const fields: FieldConfig[] = [
      {
        id: 'A',
        type: 'text',
        label: 'Campo A',
        key: 'campo_a',
        conditionalRule: { field: 'campo_b', op: '==', value: 'x' },
      },
      {
        id: 'B',
        type: 'text',
        label: 'Campo B',
        key: 'campo_b',
        conditionalRule: { field: 'campo_a', op: '==', value: 'y' },
      },
    ]
    const result = computeFieldVisibility(fields, { campo_a: 'z', campo_b: 'w' })
    expect(result.A).toBe(true)
    expect(result.B).toBe(true)
    expect(consoleWarn).toHaveBeenCalledWith(
      expect.stringContaining('Circular dependency detected')
    )
    consoleWarn.mockRestore()
  })

  // --- Missing referenced field (fail-open) ---
  it('falls open and warns when referenced field does not exist', () => {
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const fields: FieldConfig[] = [
      {
        id: 'f1',
        type: 'text',
        label: 'Dependiente',
        key: 'dependiente',
        conditionalRule: { field: 'campo_inexistente', op: '==', value: 'x' },
      },
    ]
    const result = computeFieldVisibility(fields, {})
    expect(result.f1).toBe(true)
    expect(consoleWarn).toHaveBeenCalledWith(
      expect.stringContaining("Referenced field 'campo_inexistente' not found")
    )
    consoleWarn.mockRestore()
  })

  // --- Multiple rules ---
  it('evaluates multiple conditional rules independently', () => {
    const fields: FieldConfig[] = [
      {
        id: 'f1',
        type: 'text',
        label: 'F1',
        key: 'k1',
        conditionalRule: { field: 'genero', op: '==', value: 'Femenino' },
      },
      {
        id: 'f2',
        type: 'text',
        label: 'F2',
        key: 'k2',
        conditionalRule: { field: 'edad', op: '>', value: '18' },
      },
      {
        id: 'f3',
        type: 'text',
        label: 'F3',
        key: 'k3',
      },
    ]
    const result = computeFieldVisibility(fields, { genero: 'Femenino', edad: '15' })
    expect(result.f1).toBe(true) // condition met
    expect(result.f2).toBe(false) // condition not met (15 > 18 is false)
    expect(result.f3).toBe(true) // no rule → always visible
  })

  // --- Performance: 50 rules under 100ms ---
  it('evaluates 50 conditional rules in under 100ms', () => {
    const fields: FieldConfig[] = Array.from({ length: 50 }, (_, i) => ({
      id: `f${i}`,
      type: 'text' as const,
      label: `Field ${i}`,
      key: `key_${i}`,
      conditionalRule: {
        field: 'trigger',
        op: '==' as const,
        value: 'show',
      },
    }))
    // Add 10 more fields without rules
    for (let i = 50; i < 60; i++) {
      fields.push({
        id: `f${i}`,
        type: 'text' as const,
        label: `Field ${i}`,
        key: `key_${i}`,
      })
    }
    const scope = { trigger: 'show' }
    const start = performance.now()
    const result = computeFieldVisibility(fields, scope)
    const elapsed = performance.now() - start
    expect(elapsed).toBeLessThan(100)
    // Verify all 50 conditional fields are visible
    for (let i = 0; i < 50; i++) {
      expect(result[`f${i}`]).toBe(true)
    }
    expect(Object.keys(result)).toHaveLength(60)
  })

  // --- Empty fields array ---
  it('returns empty object for empty fields array', () => {
    const result = computeFieldVisibility([], {})
    expect(result).toEqual({})
  })
})
