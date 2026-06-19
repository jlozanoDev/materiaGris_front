<script setup lang="ts">
import { onMounted, watch } from "vue";
import { useTemplateList } from "@/modules/reports/presentation/composables/useTemplateList";
import type { ReportTemplate } from "@/shared/types";
import Modal from "@/shared/components/Modal.vue";

const props = defineProps<{
  show: boolean;
  patientId: string | number;
}>();

const emit = defineEmits<{
  select: [template: ReportTemplate];
  close: [];
}>();

const { templates, loading, error, fetchActive } = useTemplateList();

function handleSelect(template: ReportTemplate): void {
  emit("select", template);
}

function handleClose(): void {
  emit("close");
}

function handleRetry(): void {
  fetchActive();
}

watch(
  () => props.show,
  (val) => {
    if (val) fetchActive();
  },
);

onMounted(() => {
  if (props.show) fetchActive();
});
</script>

<template>
  <Modal :show="show" title="Seleccionar plantilla" size="md" @close="handleClose">
    <!-- Loading state -->
    <div v-if="loading" class="flex flex-col gap-3 py-4">
      <div
        v-for="i in 3"
        :key="i"
        class="h-12 bg-slate-200 rounded-xl animate-pulse"
      ></div>
    </div>

    <!-- Error state -->
    <div
      v-else-if="error"
      class="flex flex-col items-center justify-center py-6 text-center"
    >
      <i class="pi pi-exclamation-triangle text-red-400 text-3xl mb-3"></i>
      <p class="text-slate-600 text-sm mb-3">
        Error al cargar las plantillas
      </p>
      <button
        class="px-4 py-2 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        @click="handleRetry"
      >
        Reintentar
      </button>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="templates.length === 0"
      class="flex flex-col items-center justify-center py-6 text-center"
    >
      <i class="pi pi-file text-slate-300 text-3xl mb-3"></i>
      <p class="text-slate-500 text-sm">
        No hay plantillas disponibles
      </p>
    </div>

    <!-- Template list -->
    <div v-else class="flex flex-col gap-2 py-2">
      <button
        v-for="template in templates"
        :key="template.id"
        class="w-full text-left px-4 py-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition cursor-pointer"
        @click="handleSelect(template)"
      >
        <span class="text-sm font-medium text-slate-800">
          {{ template.name }}
        </span>
        <span
          v-if="template.description"
          class="block text-xs text-slate-400 mt-0.5"
        >
          {{ template.description }}
        </span>
      </button>
    </div>
  </Modal>
</template>
