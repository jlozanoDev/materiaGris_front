<template>
  <div
    class="fixed-text-renderer"
    :style="textStyle"
    v-html="interpolatedContent"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FixedTextField } from '@/shared/types'

interface Props {
  field: FixedTextField
  /** Optional variable resolver — if not provided, uses SystemVariableRegistry.interpolate */
  variableResolver?: (text: string) => string
}

const props = defineProps<Props>()

const textStyle = computed(() => ({
  fontWeight: props.field.styling_options?.bold ? 'bold' as const : 'normal' as const,
  fontSize: getFontSize(props.field.styling_options?.size),
}))

const interpolatedContent = computed(() => {
  const text = props.field.text_content ?? ''
  if (props.variableResolver) {
    return props.variableResolver(text)
  }
  // Simple passthrough if no resolver provided (variables shown as literals)
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br />')
})

function getFontSize(size?: 'sm' | 'md' | 'lg'): string {
  switch (size) {
    case 'sm': return '0.875rem'
    case 'md': return '1rem'
    case 'lg': return '1.25rem'
    default: return '1rem'
  }
}
</script>

<style scoped>
.fixed-text-renderer {
  @apply leading-[1.625];
  color: #1f2937;
}
</style>
