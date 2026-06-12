<template>
  <div class="dynamic-form-renderer">
    <!-- Empty state -->
    <div v-if="!sections || sections.length === 0" class="dynamic-form-renderer__empty">
      Este informe no tiene campos configurados
    </div>

    <!-- Sections -->
    <div v-else class="dynamic-form-renderer__sections">
      <!-- Tab navigation -->
      <div
        v-if="displayMode === 'tabs' && sections.length > 1"
        class="dynamic-form-renderer__tabs"
        role="tablist"
      >
        <button
          v-for="(section, idx) in sections"
          :key="section.id"
          type="button"
          role="tab"
          :aria-selected="activeTab === idx"
          :class="[
            'dynamic-form-renderer__tab',
            activeTab === idx ? 'dynamic-form-renderer__tab--active' : '',
          ]"
          @click="activeTab = idx"
        >
          {{ section.label }}
        </button>
      </div>

      <!-- Section content -->
      <div
        v-for="(section, secIdx) in visibleSections"
        :key="section.id"
        :class="[
          'dynamic-form-renderer__section',
          displayMode === 'tabs' && activeTab !== secIdx ? 'hidden' : '',
        ]"
      >
        <!-- Accordion header -->
        <button
          v-if="displayMode === 'accordion'"
          type="button"
          class="dynamic-form-renderer__accordion-header"
          :class="{ 'dynamic-form-renderer__accordion-header--open': openAccordion === secIdx }"
          @click="toggleAccordion(secIdx)"
        >
          {{ section.label }}
          <span class="dynamic-form-renderer__accordion-icon">{{ openAccordion === secIdx ? '−' : '+' }}</span>
        </button>

        <!-- Section heading for default/tabs mode -->
        <h3
          v-if="displayMode !== 'accordion'"
          class="dynamic-form-renderer__section-title"
        >
          {{ section.label }}
        </h3>

        <!-- Section body (accordion collapsible) -->
        <div
          v-if="displayMode !== 'accordion' || openAccordion === secIdx"
          class="dynamic-form-renderer__section-body"
        >
          <!-- Rows -->
          <div
            v-for="row in section.rows"
            :key="row.id"
            class="dynamic-form-renderer__row"
            :style="rowStyle(row)"
          >
            <!-- Columns -->
            <div
              v-for="col in row.columns"
              :key="col.id"
              class="dynamic-form-renderer__col"
            >
              <DynamicField
                v-for="field in col.fields"
                :key="field.id"
                :field="field"
                :model-value="getFieldValue(field.key)"
                :disabled="!isEditable"
                @update:model-value="onFieldUpdate(field.key, $event)"
                @update:typed-signature="onTypedSignature(field.key, $event)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Saving indicator -->
    <div v-if="isSaving" class="dynamic-form-renderer__saving">
      Guardando...
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Section } from '@/shared/types'
import { computeFieldVisibility } from '@/shared/plugins/ConditionalLogicEngine'
import DynamicField from './DynamicField.vue'

interface Props {
  sections: Section[]
  modelValue: Record<string, any>
  isEditable: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: Record<string, any>]
  'auto-save': []
}>()

const activeTab = ref(0)
const openAccordion = ref(0)
const isSaving = ref(false)
let autoSaveTimer: ReturnType<typeof setTimeout> | null = null

// Determine display mode from first section (default: 'default')
const displayMode = computed<'tabs' | 'accordion' | 'default'>(() => {
  if (props.sections.length === 0) return 'default'
  const first = props.sections[0]
  if (first.display === 'tabs' || first.display === 'accordion') {
    return first.display
  }
  return 'default'
})

// Compute visibility for each field across all sections
const visibilityMap = computed(() => {
  const allFields = props.sections.flatMap(s =>
    s.rows.flatMap(r =>
      r.columns.flatMap(c => c.fields),
    ),
  )
  return computeFieldVisibility(allFields, props.modelValue)
})

// Filter sections to only show visible fields
const visibleSections = computed(() => {
  return props.sections.map(section => ({
    ...section,
    rows: section.rows
      .map(row => ({
        ...row,
        columns: row.columns
          .map(col => ({
            ...col,
            fields: col.fields.filter(f => visibilityMap.value[f.id] !== false),
          }))
          .filter(col => col.fields.length > 0),
      }))
      .filter(row => row.columns.length > 0),
  }))
})

function getFieldValue(key: string): unknown {
  return props.modelValue[key]
}

function onFieldUpdate(key: string, value: unknown): void {
  const updated = { ...props.modelValue, [key]: value }
  emit('update:modelValue', updated)
  triggerAutoSave()
}

function onTypedSignature(key: string, value: string): void {
  const typedKey = key + '_typed'
  const updated = { ...props.modelValue, [typedKey]: value }
  emit('update:modelValue', updated)
  triggerAutoSave()
}

function triggerAutoSave(): void {
  if (!props.isEditable) return

  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer)
  }

  autoSaveTimer = setTimeout(() => {
    isSaving.value = true
    emit('auto-save')
    setTimeout(() => {
      isSaving.value = false
    }, 500)
  }, 2000)
}

function toggleAccordion(idx: number): void {
  openAccordion.value = openAccordion.value === idx ? -1 : idx
}

function rowStyle(row: { columns: any[] }): Record<string, string> {
  const count = row.columns.length || 1
  return {
    display: 'grid',
    gridTemplateColumns: `repeat(${count}, 1fr)`,
    gap: '1rem',
  }
}

onMounted(() => {
  // Default open first accordion
  if (displayMode.value === 'accordion') {
    openAccordion.value = 0
  }
})
</script>

<style scoped>
.dynamic-form-renderer__empty {
  @apply rounded-md border border-dashed border-gray-300 p-8 text-center text-gray-500;
}
.dynamic-form-renderer__tabs {
  @apply mb-4 flex border-b border-gray-200;
}
.dynamic-form-renderer__tab {
  @apply border-b-2 border-transparent px-4 py-2 text-sm font-medium text-gray-500
    hover:text-gray-700 focus:outline-none;
}
.dynamic-form-renderer__tab--active {
  @apply border-indigo-500 text-indigo-600;
}
.dynamic-form-renderer__section {
  @apply mb-6;
}
.dynamic-form-renderer__section-title {
  @apply mb-3 text-base font-semibold text-gray-800;
}
.dynamic-form-renderer__section-body {
  @apply space-y-4;
}
.dynamic-form-renderer__section:not(.hidden) {
  display: block;
}
.hidden {
  display: none;
}
.dynamic-form-renderer__accordion-header {
  @apply flex w-full items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-left text-sm font-medium text-gray-700
    hover:bg-gray-100 focus:outline-none;
}
.dynamic-form-renderer__accordion-header--open {
  @apply border-indigo-200 bg-indigo-50;
}
.dynamic-form-renderer__accordion-icon {
  @apply text-lg leading-none;
}
.dynamic-form-renderer__row {
  @apply gap-4;
}
@media (max-width: 767px) {
  .dynamic-form-renderer__row {
    grid-template-columns: 1fr !important;
  }
}
.dynamic-form-renderer__col {
  @apply min-w-0;
}
.dynamic-form-renderer__saving {
  @apply mt-4 text-sm text-indigo-600 italic;
}
</style>
