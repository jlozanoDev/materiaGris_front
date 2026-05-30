<script setup lang="ts">
import { computed } from "vue";
import { useToast } from "@/shared/composables/useToast";

defineOptions({ name: "AppToast" });

interface Props {
  id?: number | null;
  message?: string;
  type?: string;
}

const props = withDefaults(defineProps<Props>(), {
  id: null,
  message: "",
  type: "success",
});

const classes = computed<string>(() => `toast toast--${props.type}`);

const { dismiss } = useToast();

function close(): void {
  if (props.id !== undefined && props.id !== null) dismiss(props.id);
}

const ALLOWED_TYPES: string[] = ["success", "error", "info"];
const safeType = computed<string>(() =>
  ALLOWED_TYPES.includes(props.type ?? "") ? props.type : "success",
);
</script>

<template>
  <div :class="classes" role="status" aria-live="polite">
    <svg v-if="safeType === 'success'" class="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
    <svg v-else-if="safeType === 'error'" class="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12" y2="16"/></svg>
    <svg v-else class="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="8"/></svg>
    <span class="toast-message">{{ props.message }}</span>
    <button type="button" class="toast-close" aria-label="Cerrar notificación" @click="close">
      ×
    </button>
  </div>
</template>
