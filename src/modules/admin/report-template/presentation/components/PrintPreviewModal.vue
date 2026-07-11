<template>
  <AppModal
    :show="show"
    size="xl"
    :title="`Vista impresión: ${templateName || 'Plantilla sin nombre'}`"
    icon-class="h-5 w-5 text-[#7c3aed]"
    custom-class="bg-[#f0f0f0]"
    @close="$emit('close')"
  >
    <template #icon>
      <i class="pi pi-print" />
    </template>

    <div
      v-if="!sections || sections.length === 0"
      class="flex flex-col items-center justify-center py-16"
    >
      <div class="h-16 w-16 rounded-2xl bg-[#f5f3ff] border border-[rgba(124,58,237,0.15)] flex items-center justify-center mb-4">
        <i class="pi pi-info-circle text-2xl text-[#7c3aed]" />
      </div>
      <p class="text-[#9690a8] text-sm">No hay secciones que previsualizar</p>
    </div>

    <ReportDocumentRenderer
      v-else
      :sections="sections"
      :header-sections="headerSections"
      :footer-sections="footerSections"
      :header-enabled="headerSections.length > 0"
      :footer-enabled="footerSections.length > 0"
      :values="exampleData"
      :variable-resolver="variableResolver"
    />

    <template #footer>
      <div class="flex justify-end">
        <button class="btn btn-ghost btn-sm" @click="$emit('close')">
          Cerrar
        </button>
      </div>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Section } from '@/shared/types'
import AppModal from '@/shared/components/Modal.vue'
import ReportDocumentRenderer from './ReportDocumentRenderer.vue'
import { generateExampleData } from '../utils/generateExampleData'

interface Props {
  show: boolean
  sections: Section[]
  headerSections?: Section[]
  footerSections?: Section[]
  templateName?: string
  variableResolver?: (text: string) => string
}

const props = withDefaults(defineProps<Props>(), {
  templateName: '',
  headerSections: () => [],
  footerSections: () => [],
})

defineEmits<{
  close: []
}>()

const exampleData = computed(() => {
  const allSections = [...props.sections, ...(props.headerSections ?? []), ...(props.footerSections ?? [])]
  return generateExampleData(allSections)
})
</script>
