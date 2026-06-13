import { describe, it, expect } from 'vitest'
import { evaluateExpression, evaluateFormula } from '../evaluateExpression'
import type { CalculatedFormula } from '@/shared/types'

describe('evaluateExpression', () => {
  it('evaluates simple addition', () => {
    expect(evaluateExpression('2 + 3', {})).toBe(5)
  })

  it('evaluates multiplication', () => {
    expect(evaluateExpression('4 * 5', {})).toBe(20)
  })

  it('evaluates complex expressions with precedence', () => {
    expect(evaluateExpression('2 + 3 * 4', {})).toBe(14)
  })

  it('evaluates parenthesized expressions', () => {
    expect(evaluateExpression('(2 + 3) * 4', {})).toBe(20)
  })

  it('replaces column keys with row values', () => {
    const row = { cantidad: 5, precio: 10 }
    expect(evaluateExpression('cantidad * precio', row)).toBe(50)
  })

  it('handles division', () => {
    expect(evaluateExpression('10 / 2', {})).toBe(5)
  })

  it('returns 0 for division by zero', () => {
    expect(evaluateExpression('5 / 0', {})).toBe(0)
  })

  it('returns 0 for invalid expressions', () => {
    expect(evaluateExpression('invalid + +', {})).toBe(0)
  })

  it('handles unknown column keys as 0', () => {
    expect(evaluateExpression('unknown * 5', {})).toBe(0)
  })
})

describe('evaluateFormula', () => {
  const rows = [
    { monto: 100, descuento: 10 },
    { monto: 200, descuento: 20 },
    { monto: 300, descuento: 30 },
  ]

  it('sums a column', () => {
    const formula: CalculatedFormula = { op: 'sum', sourceKey: 'monto' }
    expect(evaluateFormula(formula, rows)).toBe(600)
  })

  it('averages a column', () => {
    const formula: CalculatedFormula = { op: 'avg', sourceKey: 'monto' }
    expect(evaluateFormula(formula, rows)).toBe(200)
  })

  it('counts rows with non-zero values', () => {
    const formula: CalculatedFormula = { op: 'count', sourceKey: 'monto' }
    expect(evaluateFormula(formula, rows)).toBe(3)
  })

  it('evaluates free expression across all rows', () => {
    const formula: CalculatedFormula = { expression: 'monto - descuento' }
    // (100-10) + (200-20) + (300-30) = 90 + 180 + 270 = 540
    expect(evaluateFormula(formula, rows)).toBe(540)
  })

  it('returns 0 for empty rows', () => {
    const formula: CalculatedFormula = { op: 'sum', sourceKey: 'monto' }
    expect(evaluateFormula(formula, [])).toBe(0)
  })
})
