import type { CalculatedFormula } from '@/shared/types'

/**
 * Evaluate a calculated column formula against a row's values.
 *
 * Supports:
 * - Predefined operations: sum, avg, count (these require a range of rows)
 * - Free-form expressions: "column_a * column_b" (single-row evaluation)
 *
 * This evaluator is intentionally simple and safe:
 * - No eval(), no new Function()
 * - Only supports basic arithmetic: +, -, *, /
 * - All values are coerced to numbers
 */

// =============================================================================
// Single-row expression evaluator
// =============================================================================

/**
 * Evaluate a free-form arithmetic expression against row values.
 *
 * Syntax: supports +, -, *, /, parentheses, and column key references.
 * Example: "cantidad * precio_unitario"
 *
 * @param expression - Arithmetic expression string
 * @param row - Row data keyed by column key
 * @returns Computed number, or 0 if evaluation fails
 */
export function evaluateExpression(
  expression: string,
  row: Record<string, any>,
): number {
  try {
    // Build a safe evaluation context with row values as variables
    const context: Record<string, number> = {}
    for (const [key, val] of Object.entries(row)) {
      const num = Number(val)
      context[key] = isNaN(num) ? 0 : num
    }

    // Tokenize and evaluate
    const sanitized = sanitizeExpression(expression, context)
    if (sanitized === '') return 0

    return basicArithmetic(sanitized)
  } catch {
    return 0
  }
}

/**
 * Evaluate a formula for a range of rows.
 * Free-form expressions are evaluated per-row first, then aggregated.
 */
export function evaluateFormula(
  formula: CalculatedFormula,
  rows: Record<string, any>[],
): number {
  if ('expression' in formula) {
    // Evaluate expression per row, then sum all results
    const perRow = rows.map((row) => evaluateExpression(formula.expression, row))
    return perRow.reduce((sum, val) => sum + val, 0)
  }

  // Predefined operation
  const values = rows.map((row) => {
    const val = row[formula.sourceKey]
    return isNaN(Number(val)) ? 0 : Number(val)
  })

  switch (formula.op) {
    case 'sum':
      return values.reduce((a, b) => a + b, 0)
    case 'avg':
      return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0
    case 'count':
      return values.filter((v) => v !== 0 || String(v) !== '').length
    default:
      return 0
  }
}

// =============================================================================
// Internal: Safe arithmetic evaluator
// =============================================================================

/**
 * Replace column key references with their numeric values, then evaluate.
 */
function sanitizeExpression(
  expr: string,
  context: Record<string, number>,
): string {
  let result = expr.trim()

  // Replace identifiers (column keys) with their numeric values
  // Identifiers are alphanumeric + underscores
  result = result.replace(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g, (match) => {
    if (match in context) {
      return String(context[match])
    }
    // Check if it's a number literal
    if (!isNaN(Number(match))) return match
    // Unknown identifier → 0
    return '0'
  })

  // Remove any characters that aren't arithmetic operators, digits, dots, or parens
  result = result.replace(/[^0-9+\-*/.() ]/g, '')

  return result
}

/**
 * Basic arithmetic evaluator (no eval).
 * Handles +, -, *, / with correct precedence.
 */
function basicArithmetic(expr: string): number {
  // Simple recursive descent parser
  const tokens = tokenize(expr)
  if (tokens.length === 0) return 0

  let pos = 0

  function peek(): string | null {
    return pos < tokens.length ? tokens[pos] : null
  }

  function consume(): string {
    return tokens[pos++]
  }

  function parseAddSub(): number {
    let left = parseMulDiv()
    while (peek() === '+' || peek() === '-') {
      const op = consume()
      const right = parseMulDiv()
      if (op === '+') left += right
      else left -= right
    }
    return left
  }

  function parseMulDiv(): number {
    let left = parsePrimary()
    while (peek() === '*' || peek() === '/') {
      const op = consume()
      const right = parsePrimary()
      if (op === '*') left *= right
      else if (right !== 0) left /= right
      else left = 0 // Division by zero → 0
    }
    return left
  }

  function parsePrimary(): number {
    const token = peek()
    if (token === '(') {
      consume() // '('
      const val = parseAddSub()
      consume() // ')'
      return val
    }
    return Number(consume()) || 0
  }

  return parseAddSub()
}

function tokenize(expr: string): string[] {
  const tokens: string[] = []
  let i = 0

  while (i < expr.length) {
    const ch = expr[i]

    if (/\s/.test(ch)) {
      i++
      continue
    }

    if ('+-*/()'.includes(ch)) {
      tokens.push(ch)
      i++
      continue
    }

    // Number (including decimals)
    if (/[0-9.]/.test(ch)) {
      let num = ''
      while (i < expr.length && /[0-9.]/.test(expr[i])) {
        num += expr[i++]
      }
      tokens.push(num)
      continue
    }

    // Skip unexpected characters
    i++
  }

  return tokens
}
