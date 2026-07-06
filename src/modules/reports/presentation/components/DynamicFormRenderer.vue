<template>
  <div class="dynamic-form-renderer">
    <!-- AI Warnings -->
    <div
      v-if="aiHasWarnings && aiWarnings && aiWarnings.length > 0"
      class="mb-4 flex flex-col gap-1.5 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200"
    >
      <span class="text-xs font-semibold text-amber-700 flex items-center gap-1.5">
        <i class="pi pi-exclamation-triangle"></i>
        Advertencias de la IA
      </span>
      <ul class="list-disc list-inside">
        <li
          v-for="(warn, idx) in aiWarnings"
          :key="idx"
          class="text-xs text-amber-700"
        >
          {{ warn }}
        </li>
      </ul>
    </div>

    <!-- Read-only header zone -->
    <div
      v-if="headerSections && headerSections.length > 0"
      class="dynamic-form-renderer__readonly-zone"
    >
      <div
        v-for="section in headerSections"
        :key="section.id"
        class="dynamic-form-renderer__section"
      >
        <div
          v-for="row in section.rows"
          :key="row.id"
          class="dynamic-form-renderer__row"
          :style="rowStyle(row)"
        >
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
              :disabled="true"
              :variable-resolver="variableResolver"
              @update:model-value="() => {}"
            />
          </div>
        </div>
      </div>
    </div>

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
        v-for="(section, secIdx) in sections"
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
                :variable-resolver="variableResolver"
                :ai-review="getAIReview(field.key)"
                :ai-accept-field="aiAcceptField"
                :ai-reject-field="aiRejectField"
                :ai-edit-field="aiEditField"
                @update:model-value="onFieldUpdate(field.key, $event)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Read-only footer zone -->
    <div
      v-if="footerSections && footerSections.length > 0"
      class="dynamic-form-renderer__readonly-zone dynamic-form-renderer__readonly-zone--footer"
    >
      <div
        v-for="section in footerSections"
        :key="section.id"
        class="dynamic-form-renderer__section"
      >
        <div
          v-for="row in section.rows"
          :key="row.id"
          class="dynamic-form-renderer__row"
          :style="rowStyle(row)"
        >
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
              :disabled="true"
              :variable-resolver="variableResolver"
              @update:model-value="() => {}"
            />
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
import type { FieldReview } from '@/modules/reports/domain/entities/AIProcessing'
import DynamicField from './DynamicField.vue'

interface Props {
  sections: Section[]
  headerSections?: Section[]
  footerSections?: Section[]
  modelValue: Record<string, any>
  isEditable: boolean
  variableResolver?: (text: string) => string
  aiReviews?: FieldReview[]
  aiWarnings?: string[]
  aiHasWarnings?: boolean
  aiAcceptField?: (key: string) => void
  aiRejectField?: (key: string) => void
  aiEditField?: (key: string, value: unknown) => void
}

const props = withDefaults(defineProps<Props>(), {
  headerSections: undefined,
  footerSections: undefined,
  variableResolver: undefined,
  aiReviews: undefined,
  aiWarnings: undefined,
  aiHasWarnings: undefined,
  aiAcceptField: undefined,
  aiRejectField: undefined,
  aiEditField: undefined,
})

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

function getFieldValue(key: string): unknown {
  return props.modelValue[key]
}

function onFieldUpdate(key: string, value: unknown): void {
  const updated = { ...props.modelValue, [key]: value }
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

function getAIReview(fieldKey: string): FieldReview | undefined {
  return props.aiReviews?.find((r) => r.fieldKey === fieldKey)
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
@reference "tailwindcss";
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
  @apply mb-3 text-base font-semibold;
  color: #1f2937;
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
.dynamic-form-renderer__readonly-zone {
  @apply mb-6 rounded-md bg-gray-50 p-4 border border-gray-200;
}
.dynamic-form-renderer__readonly-zone--footer {
  @apply mt-6;
}
</style>
