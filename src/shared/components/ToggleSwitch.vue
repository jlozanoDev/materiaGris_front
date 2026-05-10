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

<script setup>
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
});
const emit = defineEmits(["update:modelValue"]);
function toggle() {
  if (props.disabled) return;
  emit("update:modelValue", !props.modelValue);
}
</script>
