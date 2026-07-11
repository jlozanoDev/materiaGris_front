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

<style>
.fixed-text-renderer h1 {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.3;
  margin: 0.5em 0 0.25em;
}

.fixed-text-renderer h2 {
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.4;
  margin: 0.5em 0 0.25em;
}

.fixed-text-renderer h3 {
  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1.4;
  margin: 0.5em 0 0.25em;
}

.fixed-text-renderer strong {
  font-weight: 600;
}

.fixed-text-renderer em {
  font-style: italic;
}

.fixed-text-renderer ul,
.fixed-text-renderer ol {
  padding-left: 1.5rem;
  margin: 0.25em 0;
}

.fixed-text-renderer li {
  margin: 0.125em 0;
}
</style>
