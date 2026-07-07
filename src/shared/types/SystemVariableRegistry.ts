/**
 * System Variable Registry
 *
 * Manages variables organized by category that can be interpolated
 * into fixed_text content using `{category.key}` syntax.
 *
 * Design:
 * - Categories: paciente, clinica, fecha, usuario
 * - Flat index: Map<string, SystemVarDef> keyed by "category.key"
 * - Resolution: replace(/\{([^}]+)\}/g, (_, path) => ...)
 * - Unresolved variables render as literal text
 */

// =============================================================================
// Types
// =============================================================================

export interface SystemVarDef {
  category: string
  key: string
  label: string
  description?: string
  resolver?: () => string
}

export type VariableMap = Map<string, SystemVarDef>

// =============================================================================
// Registry
// =============================================================================

const DEFAULT_CATEGORIES = ['paciente', 'clinica', 'fecha', 'usuario'] as const
export type SystemVariableCategory = (typeof DEFAULT_CATEGORIES)[number]

export class SystemVariableRegistry {
  /** Category -> array of variable keys */
  private categories: Map<string, string[]> = new Map()

  /** Flat index: "category.key" -> SystemVarDef */
  private flat: Map<string, SystemVarDef> = new Map()

  constructor() {
    // Initialize empty categories
    for (const cat of DEFAULT_CATEGORIES) {
      this.categories.set(cat, [])
    }
  }

  /**
   * Register a system variable under a category.
   */
  register(category: string, key: string, label: string, description?: string, resolver?: () => string): this {
    const fullKey = `${category}.${key}`

    if (this.flat.has(fullKey)) {
      throw new Error(`System variable '${fullKey}' is already registered`)
    }

    const def: SystemVarDef = { category, key, label, description, resolver }

    this.flat.set(fullKey, def)

    // Add to category index
    const catKeys = this.categories.get(category)
    if (catKeys) {
      catKeys.push(fullKey)
    } else {
      this.categories.set(category, [fullKey])
    }

    return this
  }

  /**
   * Get a variable definition by full key ("category.key").
   */
  get(fullKey: string): SystemVarDef | undefined {
    return this.flat.get(fullKey)
  }

  /**
   * Resolve a single variable to its string value.
   * If not found, returns undefined (caller decides fallback behavior).
   */
  resolve(fullKey: string): string | undefined {
    const def = this.flat.get(fullKey)
    if (!def) return undefined
    if (def.resolver) return def.resolver()
    return `{${fullKey}}`
  }

  /**
   * Interpolate all `{category.key}` placeholders in a text string.
   * Unrecognized variables are left as literal text.
   */
  interpolate(text: string): string {
    return text.replace(/\{([^}]+)\}/g, (match, path: string) => {
      const resolved = this.resolve(path.trim())
      return resolved ?? match
    })
  }

  /**
   * Search for variables matching a partial key prefix (for autocomplete).
   */
  search(prefix: string): SystemVarDef[] {
    const lower = prefix.toLowerCase()

    if (!lower) {
      return []
    }

    const results: SystemVarDef[] = []
    for (const def of this.flat.values()) {
      const fullKey = `${def.category}.${def.key}`
      if (fullKey.toLowerCase().startsWith(lower)) {
        results.push(def)
      }
    }

    return results
  }

  /**
   * Get all variables in a category.
   */
  getByCategory(category: string): SystemVarDef[] {
    const keys = this.categories.get(category)
    if (!keys) return []
    return keys.map((k) => this.flat.get(k)!).filter(Boolean)
  }

  /**
   * Get all registered variables (flat list).
   */
  getAll(): SystemVarDef[] {
    return Array.from(this.flat.values())
  }

  /**
   * Get all category names.
   */
  getCategories(): string[] {
    return Array.from(this.categories.keys())
  }

  /**
   * Number of registered variables.
   */
  get size(): number {
    return this.flat.size
  }
}
