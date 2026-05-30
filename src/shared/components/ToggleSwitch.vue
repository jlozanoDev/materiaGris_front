<template>
  <button
    type="button"
    :aria-pressed="modelValue"
    :class="['toggle', modelValue ? 'toggle--on' : '']"
    :disabled="disabled"
    @click="toggle"
  >
    <span class="toggle-thumb"></span>
  </button>
</template>

<script setup lang="ts">
interface Props {
  modelValue?: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  disabled: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();

function toggle(): void {
  if (props.disabled) return;
  emit("update:modelValue", !props.modelValue);
}
</script>
