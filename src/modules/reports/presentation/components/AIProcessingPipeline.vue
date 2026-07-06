<script setup lang="ts">
import { computed } from "vue";
import type { AIPipelineState } from "@/modules/reports/domain/entities/AIProcessing";

const props = defineProps<{
  state: AIPipelineState;
  error?: string | null;
  mode?: "record" | "upload" | "paste";
}>();

interface Step {
  key: AIPipelineState;
  label: string;
  icon: string;
}

const allSteps: Step[] = [
  { key: "recording", label: "Grabación", icon: "pi pi-microphone" },
  { key: "transcribing", label: "Transcripción", icon: "pi pi-volume-up" },
  { key: "analyzing", label: "Análisis", icon: "pi pi-sparkles" },
  { key: "reviewing", label: "Revisión", icon: "pi pi-check-circle" },
];

const steps = computed(() => {
  if (props.mode === "paste" || props.mode === "upload") {
    return allSteps.filter((s) => s.key !== "recording");
  }
  return allSteps;
});

const currentIndex = computed(() => {
  if (props.state === "idle" || props.state === "error") return -1;
  if (props.state === "done") return steps.value.length;
  return steps.value.findIndex((s: Step) => s.key === props.state);
});

function isCompleted(index: number): boolean {
  return index < currentIndex.value;
}

function isCurrent(index: number): boolean {
  return index === currentIndex.value;
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <!-- Steps -->
    <div class="flex items-center gap-2">
      <div
        v-for="(step, index) in steps"
        :key="step.key"
        class="flex items-center gap-2 flex-1"
      >
        <div
          :class="[
            'flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-colors',
            isCompleted(index)
              ? 'bg-emerald-500 text-white'
              : isCurrent(index)
                ? 'bg-indigo-600 text-white animate-pulse'
                : 'bg-slate-200 text-slate-500',
          ]"
        >
          <i v-if="isCompleted(index)" class="pi pi-check text-xs"></i>
          <i v-else :class="step.icon"></i>
        </div>
        <span
          :class="[
            'text-xs font-medium hidden sm:inline',
            isCompleted(index)
              ? 'text-emerald-600'
              : isCurrent(index)
                ? 'text-indigo-600'
                : 'text-slate-400',
          ]"
        >
          {{ step.label }}
        </span>

        <!-- Connector line -->
        <div
          v-if="index < steps.length - 1"
          :class="[
            'flex-1 h-0.5 rounded transition-colors',
            isCompleted(index) ? 'bg-emerald-500' : 'bg-slate-200',
          ]"
        ></div>
      </div>
    </div>

    <!-- Error -->
    <div
      v-if="state === 'error' && error"
      class="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-600 text-sm"
    >
      <i class="pi pi-exclamation-circle"></i>
      <span>{{ error }}</span>
    </div>
  </div>
</template>
