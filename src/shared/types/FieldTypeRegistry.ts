import type { FieldType, FieldConfig } from './index'
import type { FieldTypeMeta } from './FieldTypeMeta'
import { generateId } from '@/shared/utils/id'

/**
 * Registry of field types.
 *
 * Extensible at runtime — new types can be registered without modifying core code.
 * The builder palette and property panel dispatch derive from this registry.
 */
export class FieldTypeRegistry {
  private types: Map<FieldType, FieldTypeMeta> = new Map()
  private groups: Map<string, FieldTypeMeta[]> = new Map()

  /**
   * Register a new field type.
   * Throws if the type is already registered.
   */
  register(meta: FieldTypeMeta): this {
    if (this.types.has(meta.type)) {
      throw new Error(`Field type '${meta.type}' is already registered`)
    }

    this.types.set(meta.type, meta)

    // Group index
    const group = this.groups.get(meta.group) ?? []
    group.push(meta)
    this.groups.set(meta.group, group)

    return this
  }

  /**
   * Unregister a field type by key.
   */
  unregister(type: FieldType): void {
    const meta = this.types.get(type)
    if (!meta) return

    this.types.delete(type)

    const group = this.groups.get(meta.group)
    if (group) {
      this.groups.set(meta.group, group.filter((m) => m.type !== type))
    }
  }

  /**
   * Get metadata for a specific type.
   */
  get(type: FieldType): FieldTypeMeta | undefined {
    return this.types.get(type)
  }

  /**
   * Get all registered types (flat list).
   */
  getAll(): FieldTypeMeta[] {
    return Array.from(this.types.values())
  }

  /**
   * Get types grouped by palette group.
   */
  getGrouped(): Map<string, FieldTypeMeta[]> {
    return new Map(this.groups)
  }

  /**
   * Check if a type is registered.
   */
  has(type: FieldType): boolean {
    return this.types.has(type)
  }

  /**
   * Validate that a FieldConfig only contains properties declared for its type.
   * Returns an array of unknown property names.
   */
  validateConfig(config: FieldConfig): string[] {
    const meta = this.types.get(config.type)
    if (!meta) {
      return ['__unknown_type__']
    }

    const allowed = new Set(meta.allowedProperties)
    const unknown: string[] = []

    for (const key of Object.keys(config)) {
      if (!allowed.has(key)) {
        unknown.push(key)
      }
    }

    return unknown
  }

  /**
   * Number of registered types.
   */
  get size(): number {
    return this.types.size
  }
}

/**
 * Default factory of a field config based on type metadata.
 * Falls back to a generic field if no defaultFactory is provided.
 */
export function createFieldFromMeta(meta: FieldTypeMeta): FieldConfig {
  if (meta.defaultFactory) {
    return meta.defaultFactory()
  }

  // Generic fallback
  return {
    id: generateId(),
    type: meta.type,
    label: meta.label,
    key: meta.label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''),
    required: false,
  } as FieldConfig
}
