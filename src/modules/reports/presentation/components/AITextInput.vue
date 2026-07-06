<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  modelValue: string;
  disabled?: boolean;
  loading?: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
  process: [];
}>();

const text = computed({
  get: () => props.modelValue,
  set: (val: string) => emit("update:modelValue", val),
});

const canProcess = computed(() => text.value.trim().length > 0 && !props.loading);

function handleProcess(): void {
  if (!canProcess.value) return;
  emit("process");
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <textarea
      v-model="text"
      :disabled="disabled"
      placeholder="Pega aquí la transcripción de la consulta..."
      class="w-full h-48 p-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y disabled:opacity-50 disabled:cursor-not-allowed"
    ></textarea>

    <div class="flex justify-end">
      <button
        :disabled="!canProcess || disabled"
        :class="[
          'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors',
          canProcess && !disabled
            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
            : 'bg-slate-200 text-slate-400 cursor-not-allowed',
        ]"
        @click="handleProcess"
      >
        <i v-if="loading" class="pi pi-spinner pi-spin"></i>
        <i v-else class="pi pi-sparkles"></i>
        <span>{{ loading ? "Analizando..." : "Procesar con IA" }}</span>
      </button>
    </div>
  </div>
</template>
