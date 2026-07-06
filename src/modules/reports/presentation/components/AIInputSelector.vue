<script setup lang="ts">
import { computed } from "vue";

type InputMode = "record" | "upload" | "paste";

const props = defineProps<{
  modelValue: InputMode;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [mode: InputMode];
}>();

const modes: { value: InputMode; label: string; icon: string }[] = [
  { value: "record", label: "Grabar consulta", icon: "pi pi-microphone" },
  { value: "upload", label: "Subir audio", icon: "pi pi-upload" },
  { value: "paste", label: "Pegar transcripción", icon: "pi pi-file-edit" },
];

const activeMode = computed(() => props.modelValue);

function selectMode(mode: InputMode): void {
  if (props.disabled) return;
  emit("update:modelValue", mode);
}
</script>

<template>
  <div class="flex gap-2 p-1 bg-slate-100 rounded-xl">
    <button
      v-for="mode in modes"
      :key="mode.value"
      :class="[
        'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
        activeMode === mode.value
          ? 'bg-white text-indigo-600 shadow-sm'
          : 'text-slate-500 hover:text-slate-700',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
      ]"
      :disabled="disabled"
      @click="selectMode(mode.value)"
    >
      <i :class="mode.icon"></i>
      <span>{{ mode.label }}</span>
    </button>
  </div>
</template>
