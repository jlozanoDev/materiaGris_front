<script setup>
import { computed } from "vue";
import { useToast } from "@/shared/composables/useToast";

const props = defineProps({
  id: [String, Number],
  message: { type: String, default: "" },
  type: { type: String, default: "success" },
});

const classes = computed(() => `toast toast--${props.type}`);

const { dismiss } = useToast();

function close() {
  if (props.id !== undefined && props.id !== null) dismiss(props.id);
}

const icons = {
  success:
    '<svg class="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
  error:
    '<svg class="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12" y2="16"/></svg>',
  info: '<svg class="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="8"/></svg>',
};
</script>

<template>
  <div :class="classes" role="status" aria-live="polite">
    <span v-html="icons[props.type] || icons.success"></span>
    <span class="toast-message">{{ props.message }}</span>
    <button type="button" class="toast-close" @click="close" aria-label="Cerrar notificación">
      ×
    </button>
  </div>
</template>
