import type { ConditionalRule, FieldConfig } from '@/shared/types/index'

/**
 * Evaluate a single conditional rule against a values scope.
 *
 * Pure function — no side effects, no global scope access.
 * Operators whitelisted: ==, !=, contains, >, <, >=, <=
 * No eval(), no new Function().
 *
 * @param rule  The conditional rule with field, op, and value
 * @param scope The current form values keyed by field key
 * @returns boolean result of the evaluation
 */
export function evaluateCondition(
  rule: ConditionalRule,
  scope: Record<string, any>,
): boolean {
  const fieldValue = scope[rule.field]

  // Fail-open: if the referenced field doesn't exist in scope
  if (fieldValue === undefined) {
    console.warn(`Referenced field '${rule.field}' not found in scope`)
    return true
  }

  const ruleValue = rule.value

  switch (rule.op) {
    case '==':
      return String(fieldValue) === String(ruleValue)

    case '!=':
      return String(fieldValue) !== String(ruleValue)

    case 'contains':
      return String(fieldValue).includes(String(ruleValue))

    case '>':
    case '<':
    case '>=':
    case '<=':
      return evaluateNumeric(fieldValue, ruleValue, rule.op)

    default:
      // Unknown operator — fail open
      return true
  }
}

/**
 * Evaluate numeric comparison operators.
 * Coerces both operands to numbers. If either is NaN, falls back to string comparison.
 */
function evaluateNumeric(
  fieldValue: unknown,
  ruleValue: string,
  op: '>' | '<' | '>=' | '<=',
): boolean {
  const a = Number(fieldValue)
  const b = Number(ruleValue)

  if (!isNaN(a) && !isNaN(b)) {
    switch (op) {
      case '>': return a > b
      case '<': return a < b
      case '>=': return a >= b
      case '<=': return a <= b
    }
  }

  // Fallback to string comparison if values are not numeric
  const sa = String(fieldValue)
  const sb = ruleValue
  switch (op) {
    case '>': return sa > sb
    case '<': return sa < sb
    case '>=': return sa >= sb
    case '<=': return sa <= sb
  }
}

/**
 * Build adjacency graph and detect cycles among conditional fields.
 * Returns a Set of field keys involved in cycles.
 */
function detectCycles(fields: FieldConfig[]): Set<string> {
  // Build adjacency: field key → set of keys it depends on (via conditionalRule)
  const deps = new Map<string, Set<string>>()
  const keyToFieldId = new Map<string, string>()

  for (const f of fields) {
    keyToFieldId.set(f.key, f.id)
  }

  for (const f of fields) {
    if (f.conditionalRule) {
      const depKey = f.conditionalRule.field
      if (keyToFieldId.has(depKey)) {
        if (!deps.has(f.key)) deps.set(f.key, new Set())
        deps.get(f.key)!.add(depKey)
      }
    }
  }

  // DFS cycle detection
  const visited = new Set<string>()
  const inStack = new Set<string>()
  const cyclic = new Set<string>()

  function dfs(node: string): boolean {
    visited.add(node)
    inStack.add(node)

    const neighbors = deps.get(node)
    if (neighbors) {
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor)) {
            cyclic.add(node)
            return true
          }
        } else if (inStack.has(neighbor)) {
          // Cycle found
          cyclic.add(node)
          cyclic.add(neighbor)
          return true
        }
      }
    }

    inStack.delete(node)
    return false
  }

  for (const f of fields) {
    if (!visited.has(f.key)) {
      dfs(f.key)
    }
  }

  // Convert cyclic keys to field IDs
  const cyclicIds = new Set<string>()
  for (const key of cyclic) {
    const id = keyToFieldId.get(key)
    if (id) cyclicIds.add(id)
  }
  return cyclicIds
}

/**
 * Compute visibility map for all fields based on conditional rules.
 *
 * Fields with circular dependencies → visible (fail-open), console.warn logged.
 * Fields referencing missing fields → visible (fail-open), console.warn logged.
 * Fields without conditional rules → visible.
 *
 * @param fields    Array of FieldConfig
 * @param allValues Current form values keyed by field key
 * @returns Record mapping field ID → visibility boolean
 */
export function computeFieldVisibility(
  fields: FieldConfig[],
  allValues: Record<string, any>,
): Record<string, boolean> {
  const visibility: Record<string, boolean> = {}

  // Detect and warn about circular dependencies
  const cyclicIds = detectCycles(fields)
  if (cyclicIds.size > 0) {
    const cycleList = Array.from(cyclicIds).join(', ')
    console.warn(`Circular dependency detected between fields: ${cycleList}`)
  }

  for (const field of fields) {
    // Circular dependency → fail open
    if (cyclicIds.has(field.id)) {
      visibility[field.id] = true
      continue
    }

    if (field.conditionalRule) {
      visibility[field.id] = evaluateCondition(field.conditionalRule, allValues)
    } else {
      visibility[field.id] = true
    }
  }

  return visibility
}
