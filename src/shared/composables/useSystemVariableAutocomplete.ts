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

  function getCursorPosition(element: HTMLElement): { top: number; left: number } | null {
    // For textareas, estimate position based on text metrics
    // For inputs, use the element's bounding rect
    const rect = element.getBoundingClientRect()
    return { top: rect.bottom + window.scrollY, left: rect.left + window.scrollX }
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
