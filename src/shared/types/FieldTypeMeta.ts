import type { FieldType, FieldConfig } from './index'
import type { Component } from 'vue'

/**
 * Metadata descriptor for a field type registered in the FieldTypeRegistry.
 *
 * Each registered type provides:
 *  - icon/label/group for the builder palette
 *  - a factory to create default field configs
 *  - references to the property panel and render Vue components
 */
export interface FieldTypeMeta {
  /** Unique field type key matching FieldType union */
  type: FieldType

  /** Display label (e.g. "Texto Corto") */
  label: string

  /** Icon class for palette display */
  icon: string

  /** Group in the palette: 'text' | 'selection' | 'special' */
  group: 'text' | 'selection' | 'special'

  /** Description shown in palette tooltip */
  description: string

  /** Factory to create a default FieldConfig for this type */
  defaultFactory: () => FieldConfig

  /** Async component for the property panel editor */
  propertyComponent?: Component | (() => Promise<Component>)

  /** Async component for the form renderer */
  renderComponent?: Component | (() => Promise<Component>)

  /** Validation: list of property keys allowed for this field type */
  allowedProperties: string[]
}
