<template>
  <div ref="wrapperRef" class="relative" :class="attrs.class as string || ''">
    <button
      ref="triggerRef"
      type="button"
      :disabled="disabled"
      class="form-input flex items-center justify-between gap-2 text-left cursor-pointer w-full"
      :class="{
        'ring-2 ring-[#7c3aed]/10 border-[#7c3aed]': open,
        'opacity-50 cursor-not-allowed': disabled,
        'text-xs': size === 'sm',
      }"
      aria-haspopup="listbox"
      :aria-expanded="open"
      @click="toggle"
      @keydown="onTriggerKeydown"
    >
      <span
        class="truncate"
        :class="[size === 'sm' ? 'text-xs' : 'text-sm', selectedLabel ? 'text-[#0b0817]' : 'text-[#9690a8]']"
      >
        {{ displayText }}
      </span>
      <ChevronDown
        class="shrink-0 text-[#9690a8] transition-transform duration-200"
        :class="[size === 'sm' ? 'w-3 h-3' : 'w-4 h-4', { 'rotate-180': open }]"
      />
    </button>

    <Teleport to="body">
      <div
        v-if="open"
        ref="dropdownRef"
        class="fixed z-[9999] bg-white rounded-xl shadow-lg border border-[rgba(124,58,237,0.10)] py-1 overflow-y-auto"
        :style="dropdownStyle"
        @mousedown.prevent
      >
        <button
          v-for="(opt, idx) in resolvedOptions"
          :key="String(opt.value)"
          type="button"
          role="option"
          :aria-selected="String(opt.value) === String(modelValue)"
          class="w-full text-left transition-colors hover:bg-[#f5f3ff]"
          :class="[
            size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-sm',
            {
              'bg-[#f5f3ff] text-[#7c3aed] font-medium': String(opt.value) === String(modelValue),
              'bg-[#ede9fe]': idx === activeIdx && String(opt.value) !== String(modelValue),
            },
          ]"
          @click="selectOption(opt.value)"
          @mouseenter="activeIdx = idx"
        >
          {{ opt.label }}
        </button>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick, useAttrs } from 'vue'
import { ChevronDown } from 'lucide-vue-next'

defineOptions({ inheritAttrs: false })

interface SelectOption {
  value: unknown
  label: string
}

interface Props {
  modelValue?: unknown
  options?: (SelectOption | string | number)[]
  placeholder?: string
  disabled?: boolean
  size?: 'sm' | 'md'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  options: () => [],
  placeholder: 'Seleccionar...',
  disabled: false,
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: unknown]
  'change': [value: unknown]
}>()

const attrs = useAttrs()

const open = ref(false)
const activeIdx = ref(-1)
const triggerRef = ref<HTMLElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)
const wrapperRef = ref<HTMLElement | null>(null)
const dropdownStyle = ref<Record<string, string>>({})

const resolvedOptions = computed<SelectOption[]>(() => {
  return props.options.map((opt) => {
    if (typeof opt === 'object' && opt !== null && 'value' in opt && 'label' in opt) {
      return opt as SelectOption
    }
    return { value: opt, label: String(opt) }
  })
})

const selectedLabel = computed(() => {
  const found = resolvedOptions.value.find(
    (o) => String(o.value) === String(props.modelValue)
  )
  return found?.label ?? ''
})

const displayText = computed(() => selectedLabel.value || props.placeholder)

function toggle(): void {
  if (props.disabled) return
  if (open.value) {
    closeDropdown()
  } else {
    openDropdown()
  }
}

function openDropdown(): void {
  if (props.disabled) return
  open.value = true
  const idx = resolvedOptions.value.findIndex(
    (o) => String(o.value) === String(props.modelValue)
  )
  activeIdx.value = idx >= 0 ? idx : 0
  nextTick(() => {
    positionDropdown()
    scrollToActive()
  })
}

function closeDropdown(): void {
  open.value = false
  activeIdx.value = -1
}

function selectOption(value: unknown): void {
  emit('update:modelValue', value)
  emit('change', value)
  closeDropdown()
  nextTick(() => triggerRef.value?.focus())
}

function positionDropdown(): void {
  const trigger = triggerRef.value
  if (!trigger) return
  const rect = trigger.getBoundingClientRect()
  const spaceBelow = window.innerHeight - rect.bottom
  const dropdownHeight = Math.min(resolvedOptions.value.length * 40 + 8, 200)
  const openUpward = spaceBelow < dropdownHeight && rect.top > dropdownHeight

  dropdownStyle.value = {
    top: openUpward ? `${rect.top - dropdownHeight - 4}px` : `${rect.bottom + 4}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    maxHeight: '200px',
  }
}

function scrollToActive(): void {
  if (!dropdownRef.value || activeIdx.value < 0) return
  const el = dropdownRef.value.children[activeIdx.value] as HTMLElement
  el?.scrollIntoView({ block: 'nearest' })
}

function onTriggerKeydown(e: KeyboardEvent): void {
  if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
    e.preventDefault()
    if (!open.value) {
      openDropdown()
    } else if (e.key === 'ArrowDown') {
      activeIdx.value = Math.min(activeIdx.value + 1, resolvedOptions.value.length - 1)
      nextTick(() => scrollToActive())
    }
    return
  }

  if (open.value) {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      activeIdx.value = Math.max(activeIdx.value - 1, 0)
      nextTick(() => scrollToActive())
    } else if (e.key === 'Escape') {
      e.preventDefault()
      closeDropdown()
      nextTick(() => triggerRef.value?.focus())
    }
    // Tab: close without preventing default
    if (e.key === 'Tab') {
      closeDropdown()
    }
  }
}

function onDocumentMousedown(e: MouseEvent): void {
  if (!open.value) return
  const target = e.target as Node
  const wrapperEl = wrapperRef.value
  const ddEl = dropdownRef.value
  if (!wrapperEl || !ddEl) return
  if (!wrapperEl.contains(target) && !ddEl.contains(target)) {
    closeDropdown()
  }
}

let scrollCleanup: (() => void) | null = null

watch(open, (val) => {
  if (val) {
    const onScrollOrResize = () => positionDropdown()
    window.addEventListener('scroll', onScrollOrResize, true)
    window.addEventListener('resize', onScrollOrResize)
    scrollCleanup = () => {
      window.removeEventListener('scroll', onScrollOrResize, true)
      window.removeEventListener('resize', onScrollOrResize)
    }
  } else {
    scrollCleanup?.()
    scrollCleanup = null
  }
})

onMounted(() => {
  document.addEventListener('mousedown', onDocumentMousedown, true)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', onDocumentMousedown, true)
  scrollCleanup?.()
})
</script>
