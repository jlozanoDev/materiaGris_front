<script setup lang="ts">
interface Props {
  variant?: "text" | "circle" | "rect";
  width?: string;
  height?: string;
}

withDefaults(defineProps<Props>(), {
  variant: "text",
  width: "100%",
  height: "1rem",
});
</script>

<template>
  <div
    class="animate-pulse bg-slate-200"
    :class="variant === 'circle' ? 'rounded-full' : 'rounded-md'"
    :style="{ width, height }"
  />
</template>
