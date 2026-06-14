import { ref, type Ref } from 'vue'
import type { SystemVarDef } from '@/shared/types/SystemVariableRegistry'

/**
 * Composable for system-variable autocomplete in text editors.
 *
 * Trigger: user types `{` in an input/textarea.
 * Behavior: 150ms debounce search, dropdown shows matching variables,
 *           selecting one replaces the `{partial` with `{category.key}`.
 *
 * @param registrySearch - search function from SystemVariableRegistry
 * @returns reactive autocomplete state and helpers
 */
export function useSystemVariableAutocomplete(
  registrySearch: (prefix: string) => SystemVarDef[],
) {
  const isOpen: Ref<boolean> = ref(false)
  const query: Ref<string> = ref('')
  const results: Ref<SystemVarDef[]> = ref([])
  const activeIndex: Ref<number> = ref(0)
  const triggerPosition: Ref<{ top: number; left: number } | null> = ref(null)

  let debounceTimer: ReturnType<typeof setTimeout> | null = null
  let currentElement: HTMLInputElement | HTMLTextAreaElement | null = null
  let cursorBeforeTrigger = -1

  /**
   * Handle an input event on a text field. Detects `{` trigger,
   * extracts partial query after it, debounces search.
   */
  function handleInput(element: HTMLInputElement | HTMLTextAreaElement): void {
    currentElement = element
    const text = element.value
    const cursor = element.selectionStart ?? text.length

    // Look backwards for the last `{` before cursor
    const lastBrace = text.lastIndexOf('{', cursor - 1)
    const afterBrace = text.slice(lastBrace + 1, cursor)

    // Trigger: `{` found and no `}` between it and cursor
    if (lastBrace >= 0 && !afterBrace.includes('}')) {
      cursorBeforeTrigger = lastBrace
      query.value = afterBrace

      // Position the dropdown near the cursor
      triggerPosition.value = getCursorPosition(element)

      debouncedSearch(afterBrace)
    } else {
      close()
    }
  }

  /**
   * Handle keydown for keyboard navigation and selection.
   * Returns true if the key was consumed.
   */
  function handleKeydown(e: KeyboardEvent): boolean {
    if (!isOpen.value) return false

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        activeIndex.value = Math.min(activeIndex.value + 1, results.value.length - 1)
        return true

      case 'ArrowUp':
        e.preventDefault()
        activeIndex.value = Math.max(activeIndex.value - 1, 0)
        return true

      case 'Enter':
      case 'Tab':
        if (activeIndex.value >= 0 && activeIndex.value < results.value.length) {
          e.preventDefault()
          select(activeIndex.value)
          return true
        }
        return false

      case 'Escape':
        e.preventDefault()
        close()
        return true

      default:
        return false
    }
  }

  /**
   * Select a result by index and insert it into the text.
   */
  function select(index: number): void {
    const def = results.value[index]
    if (!def || !currentElement) return

    const fullKey = `${def.category}.${def.key}`
    const text = currentElement.value
    const before = text.slice(0, cursorBeforeTrigger)
    const after = text.slice(currentElement.selectionStart ?? text.length)

    currentElement.value = `${before}{${fullKey}}${after}`
    currentElement.dispatchEvent(new Event('input', { bubbles: true }))

    // Move cursor after the inserted variable
    const newCursor = before.length + fullKey.length + 2
    currentElement.setSelectionRange(newCursor, newCursor)
    currentElement.focus()

    close()
  }

  /**
   * Close the autocomplete dropdown.
   */
  function close(): void {
    isOpen.value = false
    query.value = ''
    results.value = []
    activeIndex.value = 0
    triggerPosition.value = null
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }
  }

  // ---- Internal helpers ----

  function debouncedSearch(partialQuery: string): void {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    debounceTimer = setTimeout(() => {
      debounceTimer = null

      if (!partialQuery) {
        // Show all variables when just `{` is typed
        results.value = registrySearch('')
        isOpen.value = results.value.length > 0
        activeIndex.value = 0
        return
      }

      const filtered = registrySearch(partialQuery)
      results.value = filtered
      isOpen.value = filtered.length > 0
      activeIndex.value = 0
    }, 150)
  }

  function getCursorPosition(element: HTMLInputElement | HTMLTextAreaElement): { top: number; left: number } | null {
    const rect = element.getBoundingClientRect()
    const style = window.getComputedStyle(element)
    const cursor = element.selectionStart ?? element.value.length

    // For inputs, simple horizontal calculation
    if (element instanceof HTMLInputElement) {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        return { top: rect.bottom, left: rect.left + 24 }
      }
      ctx.font = `${style.fontSize} ${style.fontFamily}`
      const textBefore = element.value.slice(0, cursor)
      const charWidth = ctx.measureText(textBefore).width
      const padLeft = parseFloat(style.paddingLeft) || 0
      return {
        top: rect.bottom + 4,
        left: rect.left + charWidth + padLeft + 24,
      }
    }

    // For textareas, use mirror div technique
    const mirror = document.createElement('div')
    mirror.style.position = 'fixed'
    mirror.style.top = `${rect.top}px`
    mirror.style.left = `${rect.left}px`
    mirror.style.visibility = 'hidden'
    mirror.style.pointerEvents = 'none'
    mirror.style.whiteSpace = 'pre-wrap'
    mirror.style.wordWrap = 'break-word'
    mirror.style.overflowWrap = 'break-word'
    mirror.style.width = `${rect.width}px`
    mirror.style.fontFamily = style.fontFamily
    mirror.style.fontSize = style.fontSize
    mirror.style.fontWeight = style.fontWeight
    mirror.style.lineHeight = style.lineHeight
    mirror.style.letterSpacing = style.letterSpacing
    mirror.style.paddingTop = style.paddingTop
    mirror.style.paddingBottom = style.paddingBottom
    mirror.style.paddingLeft = style.paddingLeft
    mirror.style.paddingRight = style.paddingRight
    mirror.style.boxSizing = style.boxSizing
    mirror.style.border = style.border
    document.body.appendChild(mirror)

    const textBeforeCursor = element.value.slice(0, cursor)

    const textContent = textBeforeCursor + '\u200B' // zero-width space as cursor marker
    mirror.textContent = textContent

    const range = document.createRange()
    const textNode = mirror.firstChild
    if (textNode && textNode.textContent) {
      const markerIndex = textNode.textContent.indexOf('\u200B')
      if (markerIndex >= 0) {
        range.setStart(textNode, markerIndex)
        range.setEnd(textNode, markerIndex + 1)
        const rangeRect = range.getBoundingClientRect()

        // Place dropdown below the cursor line
        const rowHeight = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.2
        const dropdownTop = rangeRect.top + rowHeight

        document.body.removeChild(mirror)
        return { top: dropdownTop, left: rangeRect.left + 24 }
      }
    }

    document.body.removeChild(mirror)

    // Fallback: use textarea bounding rect
    const lines = textBeforeCursor.split('\n')
    const rowHeight = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.2
    const estimatedTop = rect.top + lines.length * rowHeight + parseFloat(style.paddingTop)
    return { top: estimatedTop + 4, left: rect.left + parseFloat(style.paddingLeft) + 24 }
  }

  return {
    isOpen,
    query,
    results,
    activeIndex,
    triggerPosition,
    handleInput,
    handleKeydown,
    select,
    close,
  }
}
