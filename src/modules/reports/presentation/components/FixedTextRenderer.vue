<template>
  <div
    class="fixed-text-renderer"
    v-html="interpolatedContent"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FixedTextField } from '@/shared/types'

interface Props {
  field: FixedTextField
  variableResolver?: (text: string) => string
}

const props = defineProps<Props>()

const interpolatedContent = computed(() => {
  const text = props.field.text_content ?? ''

  // Resolve variables first
  const resolved = props.variableResolver ? props.variableResolver(text) : text

  // If content contains HTML tags, render as rich text directly
  if (/<[a-zA-Z][^>]*>/.test(resolved)) {
    return resolved
  }

  // Plain text fallback (backward compat with old templates)
  return resolved
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br />')
})
</script>

<style scoped>
.fixed-text-renderer {
  @apply leading-[1.625];
  color: #1f2937;
}
</style>
